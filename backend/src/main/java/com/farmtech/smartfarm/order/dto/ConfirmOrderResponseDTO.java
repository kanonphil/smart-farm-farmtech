package com.farmtech.smartfarm.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 구매 확정 처리 응답 DTO
 */
@Getter
@AllArgsConstructor
public class ConfirmOrderResponseDTO {
  /** 주문 ID */
  private int orderId;
  /** 변경된 주문 상태 */
  private String status;
  /** 구매 확정 시각 */
  private LocalDateTime confirmedAt;
}
