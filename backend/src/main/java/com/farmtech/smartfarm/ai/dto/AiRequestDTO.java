package com.farmtech.smartfarm.ai.dto;

import lombok.Data;

@Data
public class AiRequestDTO {
  private int servings;   // 인원
  private String menu;    // 메뉴명
}