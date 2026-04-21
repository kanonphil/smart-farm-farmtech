package com.farmtech.smartfarm.order.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@ToString
public class OrderDTO {
  private int orderId;
  private int memberId;
  private String orderStatus;
  private BigDecimal orderTotalPrice;
  private LocalDateTime orderCreatedAt;
  private String tossOrderId;
  private String paymentKey;
  /** 결제 완료 시각 */
  private LocalDateTime paidAt;
  /** 배송 시작 시각 */
  private LocalDateTime shippingStartedAt;
  /** 예상 배송 완료 시각 (shippingStartedAt + 2일) */
  private LocalDateTime expectedDeliveredAt;
  /** 실제 배송 완료 처리 시각 */
  private LocalDateTime shippedAt;
  /** 구매 확정 시각 */
  private LocalDateTime confirmedAt;
  private List<OrderItemDTO> orderItemDTOList;
  /** 배송 주소 */
  private String deliveryAddr;
  /** 배송 상세 주소 */
  private String deliveryAddrDetail;
}
