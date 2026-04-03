package com.farmtech.smartfarm.order.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Setter
@Getter
@ToString
public class OrderItemDTO {
  private int orderItemId;
  private int orderId;
  private int productId;
  private int orderItemQty;
  private BigDecimal orderItemPrice;
}
