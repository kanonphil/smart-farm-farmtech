package com.farmtech.smartfarm.ai.controller;

import com.farmtech.smartfarm.ai.dto.AiRequestDTO;
import com.farmtech.smartfarm.ai.dto.AiResponseDTO;
import com.farmtech.smartfarm.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {
  private final AiService aiService;

  @PostMapping("/recipe")
  public ResponseEntity<?> getRecipe(@RequestBody AiRequestDTO request){
    try {
      AiResponseDTO response = aiService.getRecipe(request);
      return ResponseEntity.ok(response);
    } catch (Exception e){
      log.error("AI 레시피 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
