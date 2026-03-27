package com.farmtech.smartfarm.product.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ProductDTO {
  private int productId;
  private int categoryId;
  private String productName;
  private int productPrice;
  private int productStock;
  private String productDesc;
  private String productStatus;
  private LocalDateTime productCreatedAt;
}
