package com.farmtech.smartfarm.stock.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 관리자 재고 목록 조회용 DTO
 * 상품 기본 정보 + 카테고리명 + 재고 포함
 */
@Getter
@Setter
public class StockListDTO {
  private int productId;
  private String productName;
  private String categoryName;
  private double productPrice;
  private int productStock;
  private String productStatus;
  private String mainImage;
}
