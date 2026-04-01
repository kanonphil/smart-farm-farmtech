package com.farmtech.smartfarm.cart.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class CartItemDTO {
  private int cartItemId;
  private int cartId;
  private int productId;
  private int cartItemQty;
}
