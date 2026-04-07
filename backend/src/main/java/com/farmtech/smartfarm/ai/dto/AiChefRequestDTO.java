package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * AI 세프 추천 요청 DTO
 *
 * 사용자가 선택한 식사 상황, 스타일,
 * 이전 추천 목록(다른 추천 보기 시 중복 방지용)을 담는다.
 */
@Getter
@Setter
@ToString
public class AiChefRequestDTO {
  // 식사 상황 (ex: 가족, 혼밥, 부모님, 어린아이, 선물)
  private String situation;

  // 원하는 스타일/맛 (예: 무난한, 스테이크, 육즙, 가성비)
  private String style;

  // 이전에 추천된 레시피명 목록
  // "다른 추천 보기" 클릭 시 중복 추천 방지를 위해 Gemini 프롬프트에 포함됨
  private List<String> previousRecipes;
}
