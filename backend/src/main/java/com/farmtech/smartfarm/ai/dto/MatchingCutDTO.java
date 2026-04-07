package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 레시피에 매칭된 상품 DTO
 *
 * ProductListDTO를 감싸고 매칭 점수와 이유를 추가한다.
 * 점수 기준: 부위명 일치(+100) > 재료명 일치(+50) > 키워드 일치(+20)
 */
@Getter
@Setter
public class MatchingCutDTO {
  // 상품 ID
  private int productId;

  // 상품명
  private String productName;

  // 상품 가격
  private double productPrice;

  // 재고 수량
  private int productStock;

  // 상품 상태 (ACTIVE/INACTIVE)
  private String productStatus;

  // 메인 이미지 URL
  private String mainImage;

  // 판매 수량
  private int salesCount;
}
