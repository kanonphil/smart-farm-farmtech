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
  private List<OrderItemDTO> orderItemDTOList;
}
