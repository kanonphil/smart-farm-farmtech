package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 추천 부위 DTO
 *
 * Gemini 응답의 matchingCuts 배열 항목에 매핑된다.
 * DB 상품 매칭에 직접 사용된다.
 */
@Getter
@Setter
public class IngredientDTO {
  // 부위명 (예: 살치살, 등심) - DB 검색 키워드로 사용
  private String cutName;

  // 이 부위를 추천하는 이유
  private String why;
}
