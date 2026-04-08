package com.farmtech.smartfarm.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 관리자 주문 목록 조회율 DTO
 */
@Getter
@Setter
public class ManagerOrderDTO {
  private int orderId;
  private int memberId;
  private String orderStatus;
  private BigDecimal orderTotalPrice;
  private LocalDateTime orderCreatedAt;
  private LocalDateTime paidAt;
  private LocalDateTime shippingStartedAt;
  private LocalDateTime expectedDeliveredAt;
  private LocalDateTime shippedAt;
  private LocalDateTime confirmedAt;
}
