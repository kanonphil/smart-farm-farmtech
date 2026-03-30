package com.farmtech.smartfarm.payment.controller;

import com.farmtech.smartfarm.payment.dto.PaymentConfirmRequestDTO;
import com.farmtech.smartfarm.payment.dto.TossConfirmResponseDTO;
import com.farmtech.smartfarm.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 결제 관련 요청을 받는 컨트롤러
 *
 * 프론트의 PaymentSuccess 페이지에서
 * paymentKey, orderId, amount를 전달하면
 * 이 컨트롤러가 받아서 Service로 넘긴다
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final PaymentService paymentService;

  /**
   * 결제 승인 요청 API
   *
   * 프론트에서 successUrl로 이동한 뒤
   * 아래 3개 값을 서버로 전달한다.
   *
   * - paymentKey : 토스가 발급한 결제 키
   * - orderId    : 토스 결제 요청 시 사용한 주문번호
   * - amount     : 결제 금액
   *
   * 서버는 이 값을 받아서
   * 1) DB 주문 조회
   * 2) 금액 검증
   * 3) 토스 승인 API 호출
   * 4) 주문 상태 변경
   * 순서로 처리한다.
   */
  @PostMapping("/confirm")
  public ResponseEntity<TossConfirmResponseDTO> confirmPayment(
          @RequestBody PaymentConfirmRequestDTO requestDTO
          ) {
    // 서비스에 실제 결제 승인 로직 위임
    TossConfirmResponseDTO responseDTO = paymentService.confirmPayment(requestDTO);

    // 성공 시 200 OK + 응답 데이터 반환
    return ResponseEntity.ok(responseDTO);
  }
}
