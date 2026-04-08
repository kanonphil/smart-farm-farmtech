package com.farmtech.smartfarm.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 관리자 배송 시작 처리 응답 DTO
 */
@Getter
@AllArgsConstructor
public class ShippingStartResponseDTO {
  /** 주문 ID */
  private int orderId;
  /** 변경된 주문 상태 */
  private String status;
  /** 배송 시작 시각 */
  private LocalDateTime shippingStartedAt;
  /** 예상 배송 완료 시각 (시작 + 2일) */
  private LocalDateTime expectedDeliveredAt;
}
