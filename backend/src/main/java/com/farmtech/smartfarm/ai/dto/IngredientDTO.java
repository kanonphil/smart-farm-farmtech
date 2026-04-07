package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 레시피 재료 DTO
 *
 * Gemini 응답의 ingredients 배열 항목에 매핑된다.
 */
@Getter
@Setter
public class IngredientDTO {
  // 재료명 (예: 살치살, 소금)
  private String name;

  // 분량 (예: 500g, 약간)
  private String amount;
}
