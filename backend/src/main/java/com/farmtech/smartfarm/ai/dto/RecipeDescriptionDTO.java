package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 레시피 기본 정보 DTO
 *
 * Gemini 응답의 recipeDescription 필드에 매핑된다.
 */
@Getter
@Setter
public class RecipeDescriptionDTO {
  // 조리 난이도 (하/중/상)
  private String difficulty;

  // 조리 방법 (예: 팬 시어링, 숯불구이)
  private String cookingMethod;

  // 어울리는 분위기 (예: 특별한 저녁, 캠핑)
  private String mood;

  // 예상 조리 시간
  private int estimatedTimeMinutes;
}
