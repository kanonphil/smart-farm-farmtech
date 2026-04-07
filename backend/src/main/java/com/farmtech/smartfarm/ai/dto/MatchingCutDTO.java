package com.farmtech.smartfarm.ai.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatchingCutDTO {
  // 부위명 (예: 살치살, 등심) - DB 검색 키워드로 사용
  private String cutName;

  // 이 부위를 추천하는 이유
  private String why;
}
