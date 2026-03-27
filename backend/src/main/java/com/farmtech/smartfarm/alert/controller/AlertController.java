package com.farmtech.smartfarm.alert.controller;

import com.farmtech.smartfarm.alert.dto.AlertDTO;
import com.farmtech.smartfarm.alert.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
@Slf4j
public class AlertController {
  private final AlertService alertService;

  // 알림 이력 조회 (최신순 100개)
  @GetMapping("")
  public ResponseEntity<?> getAlerts() {
    try {
      List<AlertDTO> list = alertService.getAlerts();
      return ResponseEntity.status(HttpStatus.OK).body(list);
    } catch (Exception e) {
      log.error("알림 이력 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("message", "알림 이력 조회 실패"));
    }
  }
}
