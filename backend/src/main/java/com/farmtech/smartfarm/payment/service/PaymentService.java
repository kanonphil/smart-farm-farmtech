package com.farmtech.smartfarm.payment.service;

import com.farmtech.smartfarm.payment.dto.PaymentConfirmRequestDTO;
import com.farmtech.smartfarm.payment.dto.PaymentDTO;
import com.farmtech.smartfarm.payment.dto.TossConfirmResponseDTO;
import com.farmtech.smartfarm.payment.mapper.PaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * 결제 관련 비즈니스 로직 처리 클래스
 *
 * 여기서 실제로
 * - 요청값 검증
 * - 주문 조회
 * - 금액 검증
 * - 토스 승인 API 호출
 * - DB 상태 변경
 * 을 수행한다.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {
  private final PaymentMapper paymentMapper;

  /**
   * application.properties 에서 주입받는 토스 시크릿 키
   *
   * 예:
   * toss.payments.secret-key=test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6
   */
  @Value("${toss.payments.secret-key}")
  private String secretKey;

  /**
   * 토스 결제 승인 API 주소
   *
   * 예:
   * toss.payments.confirm-url=https://api.tosspayments.com/v1/payments/confirm
   */
  @Value("${toss.payments.confirm-url}")
  private String confirmUrl;

  /**
   * 결제 승인 전체 로직
   *
   * @Transactional:
   * 중간에 예외가 발생하면 DB 변경 내용을 롤백하기 위해 사용
   */
  @Transactional
  public TossConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO requestDTO) {
    // ---------------------------
    // 1. 요청값 기본 검증
    // ---------------------------
    validateRequest(requestDTO);

    // ---------------------------
    // 2. DB에서 주문 조회
    // ---------------------------
    // orderId는 토스용 주문번호 (예: ORDER_15) 라고 가정
    PaymentDTO dto = paymentMapper.selectOrderByTossOrderId(requestDTO.getOrderId());

    if (dto == null) {
      throw new IllegalArgumentException("해당 주문을 찾을 수 없습니다.");
    }

    // ---------------------------
    // 3. 주문 상태 확인
    // ---------------------------
    // 이미 결제 완료된 주문을 또 승인하면 안 되므로 READY 상태만 허용
    if (!"READY".equals(dto.getOrderStatus())) {
      throw new IllegalArgumentException("결제 가능한 주문 상태가 아닙니다.");
    }

    // ---------------------------
    // 4. 금액 검증
    // ---------------------------
    // 프론트에서 전달한 금액과 DB 주문 금액이 같은지 확인
    // 이 검증이 중요한 이유:
    // 사용자가 프론트에서 amount를 바꿔치기할 가능성을 막기 위해서
    if (!dto.getOrderTotalPrice().equals(requestDTO.getAmount())) {
      throw new IllegalArgumentException("결제 금액이 주문 금액과 일치하지 않습니다.");
    }

    // ---------------------------
    // 5. 토스 승인 API 호출
    // ---------------------------
    TossConfirmResponseDTO tossResponse = requestTossConfirmApi(requestDTO);

    // ---------------------------
    // 6. 토스 승인 결과 확인
    // ---------------------------
    // 테스트 환경에서도 정상 승인되면 보통 status = DONE
    if (tossResponse == null) {
      throw new IllegalArgumentException("토스 결제 승인 응답이 없습니다.");
    }

    if (!"DONE".equals(tossResponse.getStatus())) {
      throw new IllegalStateException("토스 결제 승인이 완료되지 않았습니다.");
    }

    // ---------------------------
    // 7. DB 주문 상태 변경
    // ---------------------------
    // 결제 성공했으므로 READY -> PAID 로 변경
    // paymentKey도 같이 저장해두면 나중에 조회/취소할 때 편함
    int updateResult = paymentMapper.updateOrderPaid(
            requestDTO.getOrderId(),
            tossResponse.getPaymentKey()
    );

    if (updateResult != 1) {
      throw new IllegalStateException("주문 상태 업데이트에 실패했습니다.");
    }

    // ---------------------------
    // 8. 재고 차감 (선택)
    // ---------------------------
    // 지금은 공부 단계니까 일단 보류 가능
    // 나중에 여기서 order_item 조회 후 product 재고 차감하면 됨
    //
    // 예:
    // paymentMapper.decreaseProductStockByOrderId(requestDto.getOrderId());

    // 최종적으로 토스 응답을 그대로 반환
    return tossResponse;
  }

  /**
   * 토스 결제 승인 API 호출 메서드
   *
   * 토스 승인 API는 서버에서 호출해야 함.
   * 프론트에서 직접 호출하면 secretKey가 노출되므로 절대 안 됨.
   */
  private TossConfirmResponseDTO requestTossConfirmApi(PaymentConfirmRequestDTO requestDTO) {
    // ------------------------------------------
    // 1. Authorization 헤더용 Basic 인증값 생성
    // ------------------------------------------
    // 토스는 "secretKey:" 문자열을 Base64 인코딩해서
    // Authorization: Basic xxx 형태로 보낸다.
    System.out.println("secretKey: " + secretKey);

    String encodedAuth = Base64.getEncoder().encodeToString(
            (secretKey + ":").getBytes(StandardCharsets.UTF_8)
    );

    // ------------------------------------------
    // 2. HTTP 헤더 설정
    // ------------------------------------------
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Basic " + encodedAuth);

    // ------------------------------------------
    // 3. 요청 Body 구성
    // ------------------------------------------
    // 토스 승인 API에 필요한 값 3개
    Map<String, Object> body = new HashMap<>();
    body.put("paymentKey", requestDTO.getPaymentKey());
    body.put("orderId", requestDTO.getOrderId());
    body.put("amount", requestDTO.getAmount());

    // 헤더 + 바디를 합쳐서 HttpEntity 생성
    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

    // ------------------------------------------
    // 4. 외부 API 호출
    // ------------------------------------------
    // RestTemplate은 간단한 외부 API 호출에 많이 사용됨
    RestTemplate restTemplate = new RestTemplate();

    ResponseEntity<TossConfirmResponseDTO> response = restTemplate.exchange(
            confirmUrl,                   // 호출할 URL
            HttpMethod.POST,              // HTTP 메서드
            entity,                       // 요청 데이터
            TossConfirmResponseDTO.class  // 응답을 받을 DTO 타입
    );

    // 응답 바디 변환
    return response.getBody();
  }

  /**
   * 프론트에서 넘어온 값이 정상인지 기본 검증
   */
  private void validateRequest(PaymentConfirmRequestDTO requestDTO) {
    // paymentKey 검증
    if (requestDTO.getPaymentKey() == null || requestDTO.getPaymentKey().isBlank()) {
      throw new IllegalArgumentException("paymentKey가 없습니다.");
    }

    // orderId 검증
    if (requestDTO.getOrderId() == null || requestDTO.getOrderId().isBlank()) {
      throw new IllegalArgumentException("orderId가 없습니다.");
    }

    // paymentKey 검증
    if (requestDTO.getAmount() == null || requestDTO.getAmount() <= 0) {
      throw new IllegalArgumentException("amount 값이 올바르지 않습니다.");
    }
  }
}
