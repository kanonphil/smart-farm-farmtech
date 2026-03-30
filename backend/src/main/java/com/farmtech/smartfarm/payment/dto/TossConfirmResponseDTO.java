package com.farmtech.smartfarm.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossConfirmResponseDTO {
  private String paymentKey;
  private String orderId;
  private String status;
  private Long totalAmount;
  private String method;
}
