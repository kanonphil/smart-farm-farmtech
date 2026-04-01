package com.farmtech.smartfarm.cart.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
public class CartDTO {
  private int cartId;
  private int memberId;
  private List<CartItemDTO> cartItemDTOList;
}
