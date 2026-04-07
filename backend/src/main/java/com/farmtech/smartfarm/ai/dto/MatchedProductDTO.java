package com.farmtech.smartfarm.ai.dto;

import com.farmtech.smartfarm.product.dto.ProductListDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 레시피에 매칭된 상품 DTO
 *
 * ProductListDTO를 감싸고 매칭 점수와 이유를 추가한다.
 * 점수 기준: 부위명 일치(+100) > 재료명 일치(+50) > 키워드 일치(+20)
 */
@Getter
@Setter
@ToString
public class MatchedProductDTO {
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

  // 매칭 점수 (높을수록 우선 노출)
  private int score;

  // 매칭 이유 (예: 레시피 핵심 부위)
  private String matchReason;

  /**
   * ProductListDTO로부터 MatchedProductDTO를 생성하는 생성자
   * @param p 상품 목록 DTO
   */
  public MatchedProductDTO(ProductListDTO p) {
    this.productId = p.getProductId();
    this.productName = p.getProductName();
    this.productPrice = p.getProductPrice();
    this.productStock = p.getProductStock();
    this.productStatus = p.getProductStatus();
    this.mainImage = p.getMainImage();
    this.salesCount = p.getSalesCount();
    this.score = 0;
  }

  /**
   * 매칭 점수 누적 메서드
   * 동일 상품이 여러 키워드에 매칭될 경우 점수가 합산됨
   * @param points 추가할 점수
   */
  public void addScore(int points) {
    this.score += points;
  }
}
