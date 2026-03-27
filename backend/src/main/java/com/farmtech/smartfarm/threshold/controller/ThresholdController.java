package com.farmtech.smartfarm.threshold.controller;

import com.farmtech.smartfarm.threshold.dto.ThresholdPresetDTO;
import com.farmtech.smartfarm.threshold.service.ThresholdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/thresholds")
@RequiredArgsConstructor
@Slf4j
public class ThresholdController {
  private final ThresholdService thresholdService;

  // 전체 프리셋 목록 조회
  @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getAllPreset() {
    try {
      List<ThresholdPresetDTO> list = thresholdService.getAllPreset();
      return ResponseEntity.status(HttpStatus.OK).body(list);
    } catch (Exception e) {
      log.error("프리셋 목록 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "프리셋 목록 조회 실패"));
    }
  }

  // 현재 활성화된 프리셋 조회
  @GetMapping("/active")
  public ResponseEntity<?> getActivatePreset() {
    try {
      return ResponseEntity.status(HttpStatus.OK).body(thresholdService.getActivatePreset());
    } catch (Exception e) {
      log.error("활성 프리셋 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "활성 프리셋 조회 실패"));
    }
  }

  // 새 프리셋 생성
  @PostMapping("")
  public ResponseEntity<?> createPreset(@RequestBody ThresholdPresetDTO dto) {
    try {
      thresholdService.createPreset(dto);
      return ResponseEntity.status(HttpStatus.OK).body(dto);
    } catch (Exception e) {
      log.error("프리셋 생성 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "프리셋 생성 실패"));
    }
  }

  // 프리셋 수정
  @PutMapping("/{id}")
  public ResponseEntity<?> updatePreset(@PathVariable int id, @RequestBody ThresholdPresetDTO dto) {
    try {
      dto.setId(id);
      thresholdService.updatePreset(dto);
      return ResponseEntity.status(HttpStatus.OK).build();
    } catch (Exception e) {
      log.error("프리셋 수정 실패");
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "프리셋 수정 실패"));
    }
  }

  // 프리셋 삭제
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deletePreset(@PathVariable int id) {
    try {
      thresholdService.deletePreset(id);
      return ResponseEntity.status(HttpStatus.OK).build();
    } catch (Exception e) {
      log.error("프리셋 삭제 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "프리셋 삭제 실패"));
    }
  }

  // 프리셋 활성화 (선택한 프리셋을 현재 임계값으로 적용)
  @PutMapping("/{id}/activate")
  public ResponseEntity<?> activatePreset(@PathVariable int id) {
    try {
      thresholdService.activatePreset(id);
      return ResponseEntity.status(HttpStatus.OK).build();
    } catch (Exception e) {
      log.error("프리셋 활성화 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
