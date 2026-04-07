package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * AI 셰프 추천 응답 DTO
 *
 * 레시피 정보와 DB 매칭 상품을 함께 반환한다.
 * Gemini 실패 또는 상품 매칭 실패 시 fallback 정보를 포함한다.
 */
@Getter
@Setter
public class AiChefResponseDTO {
  // Gemini가 추천한 레시피
  private RecipeDTO recipe;

  // DB에서 매칭된 상품 목록 (최대 3개, 점수 내림차순)
  private List<MatchedProductDTO> matchedProducts;

  // fallback 여부
  // true이면 Gemini 호출 실패로 기본 추천 레시피를 반환한 것
  private boolean fallback;

  // fallback 시 사용자에게 보여줄 안내 메시지
  private String fallbackMessage;

  // 상품 매칭 실패 시 메시지
  private String productMatchMessage;
}
