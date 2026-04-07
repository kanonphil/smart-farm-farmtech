package com.farmtech.smartfarm.review.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UnreviewedItemDTO {
  private int orderItemId;
  private int productId;
  private String productName;
  private int orderItemQty;
  private int orderItemPrice;
  private String orderDate;
}
