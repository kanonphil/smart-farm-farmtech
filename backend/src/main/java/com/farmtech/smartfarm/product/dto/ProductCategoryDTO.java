package com.farmtech.smartfarm.product.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class ProductCategoryDTO {
  private int categoryId;
  private String categoryName;
}
