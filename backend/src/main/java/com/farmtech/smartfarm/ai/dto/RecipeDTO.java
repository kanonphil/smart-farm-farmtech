package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Gemini API 응답 레시피 DTO
 *
 * Gemini가 반환하는 JSON 구조와 1:1 매핑된다.
 * 파싱 실패 시 fallback 레시피로 대체된다.
 */
@Getter
@Setter
@ToString
public class RecipeDTO {
  // 레시피명 (예: 살치살 스테이크)
  private String recipeName;

  // 한 줄 요약
  private String summary;

  // 선정 이유 타이틀
  private String recommendedReasonTitle;

  // 선청 이유 상세 설명
  private String recommendedReasonBody;

  // 레시피 기본 정보 (난이도, 조리방법, 분위기, 시간)
  private RecipeDescriptionDTO recipeDescription;

  // 재료 목록
  private List<IngredientDTO> ingredients;

  // 조리 단계
  private List<String> steps;

  // 매칭할 부위 목록
  // AiChefService에서 DB 상품 검생 키워드로 사용됨
  private List<MatchingCutDTO> matchingCuts;

  // 서빙 팁
  private List<String> servingTips;

  // 보조 검색 키워드
  // matchingCuts로 상품을 못 찾을 때 보조 검색에 사용됨
  private List<String> searchKeywords;

  // Gemini가 우리 DB 상품 목록에서 직접 선택한 productId 목록
  // 1~3개, 없으면 빈 배열
  private List<Integer> matchingProductIds;

  private List<Integer> sideProductIds;
}
