package com.farmtech.smartfarm.ai.controller;

import com.farmtech.smartfarm.ai.dto.AiChefRequestDTO;
import com.farmtech.smartfarm.ai.dto.AiChefResponseDTO;
import com.farmtech.smartfarm.ai.service.AiChefService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI 셰프 추천 컨트롤러
 *
 * 비로그인 사용자도 접근 가능하다.
 * (SecurityConfig에서 /api/ai-chef/** 허용 필요)
 */
@Slf4j
@RestController
@RequestMapping("/api/ai-chef")
@RequiredArgsConstructor
public class AiChefController {

  private final AiChefService aiChefService;

  /**
   * AI 셰프 레시피 추천 API
   *
   * 사용자 조건(상황/스타일)을 받아 Gemini로 레시피를 생성하고
   * DB에서 매칭 상품을 찾아 반환한다.
   *
   * @param request 사용자 선택 조건 (situation, style, previousRecipes)
   * @return 레시피 + 매칭 상품
   */
  @PostMapping("/recommend")
  public ResponseEntity<?> recommend(@RequestBody AiChefRequestDTO request) {
    try {
      AiChefResponseDTO response = aiChefService.recommend(request);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      log.error("[AiChef] 추천 API 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body("추천 서비스에 일시적인 오류가 발생했습니다.");
    }
  }
}
