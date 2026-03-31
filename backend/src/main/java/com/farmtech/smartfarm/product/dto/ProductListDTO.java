package com.farmtech.smartfarm.product.dto;

import lombok.Getter;
import lombok.Setter;

// 상품 등록 조회에 필요한 데이터만 담는 DTO
// ProductDTO와 분리한 이유: 목록에서는 상세 설명(productDesc), 등록일 등 불필요한 데이터 제외
@Getter
@Setter
public class ProductListDTO {
  private int productId;          // 상품 고유 ID
  private int categoryId;         // 카테고리 ID
  private String productName;     // 상품명
  private double productPrice;    // 상품 가격
  private int productStock;       // 재고 수량
  private String productStatus;   // 상품 상태 (ACTIVE / INACTIVE)
  private String mainImage;       // 대표 이미지 저장명 (V_PRODUCT_LIST VIEW에서 가져옴)
  private int salesCount;         // 판매량 (V_PRODUCT_LIST VIEW에서 집계)
}
