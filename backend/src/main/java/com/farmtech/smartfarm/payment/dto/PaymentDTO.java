package com.farmtech.smartfarm.payment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PaymentDTO {
  private int orderId;
  private int memberId;

  private String orderStatus;
  private Long orderTotalPrice;

  private String tossOrderId;
  private String paymentKey;
}
