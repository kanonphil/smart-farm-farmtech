package com.farmtech.smartfarm.payment.service;

import com.farmtech.smartfarm.payment.dto.PaymentConfirmRequestDTO;
import com.farmtech.smartfarm.payment.dto.PaymentDTO;
import com.farmtech.smartfarm.payment.dto.TossConfirmResponseDTO;
import com.farmtech.smartfarm.payment.mapper.PaymentMapper;
import com.farmtech.smartfarm.product.dto.ProductStockDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {
  private final PaymentMapper paymentMapper;

  @Value("${toss.payments.secret-key}")
  private String secretKey;

  @Value("${toss.payments.confirm-url}")
  private String confirmUrl;

  @Value("${toss.payments.cancel-base-url}")
  private String cancelBaseUrl;

  /**
   * 결제 승인 전체 로직
   *
   * 처리 순서:
   *  1. 요청값 검증
   *  2. 주문 조회 + 상태 / 금액 검증
   *  3. 재고 잠금 조회 (FOR UPDATE) — Toss 호출 전 재고 부족 차단
   *  4. Toss 승인 API 호출 (외부, 롤백 불가)
   *  5. 주문 상태 변경 + 재고 차감
   *     → 실패 시 Toss 자동 취소 + 트랜잭션 롤백
   *
   * 3번에서 FOR UPDATE 로 잠그므로 동시 결제 요청에 의한
   * 재고 초과를 방지합니다.
   * 4번 이후 5번이 실패하면 Toss 를 자동 취소해 정합성을 유지합니다.
   */
  @Transactional
  public TossConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO requestDTO) {
    // 1. 요청값 기본 검증
    validateRequest(requestDTO);

    // 2. 주문 조회 + 상태 / 금액 검증
    PaymentDTO dto = paymentMapper.selectOrderByTossOrderId(requestDTO.getOrderId());
    if (dto == null) {
      throw new IllegalArgumentException("해당 주문을 찾을 수 없습니다.");
    }
    if (!"READY".equals(dto.getOrderStatus())) {
      throw new IllegalArgumentException("결제 가능한 주문 상태가 아닙니다.");
    }
    if (!dto.getOrderTotalPrice().equals(requestDTO.getAmount())) {
      throw new IllegalArgumentException("결제 금액이 주문 금액과 일치하지 않습니다.");
    }

    // 3. 재고 잠금 조회 (FOR UPDATE) — Toss 호출 전 재고 부족을 미리 차단
    List<ProductStockDTO> stocks = paymentMapper.selectProductStockForUpdate(dto.getOrderId());
    boolean hasInsufficientStock = stocks.stream()
            .anyMatch(s -> s.getProductStock() < s.getRequiredQty());
    if (hasInsufficientStock) {
      throw new IllegalStateException("재고가 부족하여 결제를 진행할 수 없습니다.");
    }

    // 4. Toss 승인 API 호출 (외부 호출, DB 트랜잭션으로 롤백 불가)
    TossConfirmResponseDTO tossResponse = requestTossConfirmApi(requestDTO);
    if (tossResponse == null || !"DONE".equals(tossResponse.getStatus())) {
      throw new IllegalStateException("토스 결제 승인이 완료되지 않았습니다.");
    }

    // 5. 주문 상태 변경 + 재고 차감
    // Toss 는 이미 승인됐으므로, DB 작업 실패 시 Toss 를 즉시 취소해 정합성을 유지합니다.
    try {
      int updateResult = paymentMapper.updateOrderPaid(
              requestDTO.getOrderId(), tossResponse.getPaymentKey());
      if (updateResult != 1) {
        throw new IllegalStateException("주문 상태 업데이트에 실패했습니다.");
      }

      int decreased = paymentMapper.decreaseProductStock(dto.getOrderId());
      if (decreased != stocks.size()) {
        throw new IllegalStateException("재고 차감에 실패했습니다.");
      }

    } catch (Exception e) {
      // DB 작업 실패 → Toss 자동 취소로 고객 환불
      requestTossCancelApi(tossResponse.getPaymentKey(), "시스템 오류로 인한 자동 환불");
      throw new IllegalStateException("결제 처리 중 오류가 발생하여 자동 환불되었습니다.", e);
    }

    return tossResponse;
  }

  /**
   * 결제 취소 (환불)
   */
  @Transactional
  public void cancelPayment(int orderId, String cancelReason) {
    PaymentDTO dto = paymentMapper.selectOrderByOrderId(orderId);
    if (dto == null) throw new IllegalArgumentException("해당 주문을 찾을 수 없습니다.");
    if (!"PAID".equals(dto.getOrderStatus())) throw new IllegalArgumentException("환불 가능한 주문 상태가 아닙니다.");

    requestTossCancelApi(dto.getPaymentKey(), cancelReason);

    int result = paymentMapper.updateOrderRefunded(orderId, cancelReason);
    if (result != 1) throw new IllegalArgumentException("주문 상태 업데이트에 실패했습니다.");

    paymentMapper.restoreProductStock(orderId);
  }

  /**
   * Toss 승인 API 호출
   */
  private TossConfirmResponseDTO requestTossConfirmApi(PaymentConfirmRequestDTO requestDTO) {
    String encodedAuth = Base64.getEncoder().encodeToString(
            (secretKey + ":").getBytes(StandardCharsets.UTF_8));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Basic " + encodedAuth);

    Map<String, Object> body = new HashMap<>();
    body.put("paymentKey", requestDTO.getPaymentKey());
    body.put("orderId",    requestDTO.getOrderId());
    body.put("amount",     requestDTO.getAmount());

    ResponseEntity<TossConfirmResponseDTO> response = new RestTemplate().exchange(
            confirmUrl, HttpMethod.POST,
            new HttpEntity<>(body, headers),
            TossConfirmResponseDTO.class);

    return response.getBody();
  }

  /**
   * Toss 취소 API 호출 (DB 변경 없음)
   *
   * confirmPayment 실패 시 자동 환불, cancelPayment 에서 재사용합니다.
   */
  private void requestTossCancelApi(String paymentKey, String cancelReason) {
    String encodedAuth = Base64.getEncoder().encodeToString(
            (secretKey + ":").getBytes(StandardCharsets.UTF_8));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Basic " + encodedAuth);

    Map<String, Object> body = new HashMap<>();
    body.put("cancelReason", cancelReason);

    try {
      new RestTemplate().exchange(
              cancelBaseUrl + paymentKey + "/cancel",
              HttpMethod.POST,
              new HttpEntity<>(body, headers),
              Map.class);
    } catch (HttpClientErrorException e) {
      if (!e.getResponseBodyAsString().contains("ALREADY_CANCELED_PAYMENT")) {
        throw e;
      }
    }
  }

  private void validateRequest(PaymentConfirmRequestDTO requestDTO) {
    if (requestDTO.getPaymentKey() == null || requestDTO.getPaymentKey().isBlank()) {
      throw new IllegalArgumentException("paymentKey가 없습니다.");
    }
    if (requestDTO.getOrderId() == null || requestDTO.getOrderId().isBlank()) {
      throw new IllegalArgumentException("orderId가 없습니다.");
    }
    if (requestDTO.getAmount() == null || requestDTO.getAmount() <= 0) {
      throw new IllegalArgumentException("amount 값이 올바르지 않습니다.");
    }
  }
}