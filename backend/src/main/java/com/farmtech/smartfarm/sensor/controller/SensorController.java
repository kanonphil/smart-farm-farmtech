package com.farmtech.smartfarm.sensor.controller;

import com.farmtech.smartfarm.sensor.dto.SensorHistoryResponseDTO;
import com.farmtech.smartfarm.sensor.dto.SensorResponseDTO;
import com.farmtech.smartfarm.sensor.service.SensorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/sensors")
@RequiredArgsConstructor
@Slf4j
public class SensorController {
  private final SensorService sensorService;

  // 대기질, 조도, 최근 온,습도 10개의 데이터를 한번에 조회할 api
  @GetMapping("")
  public ResponseEntity<?> getSensorData(){
    try {
      SensorResponseDTO response = sensorService.getSensorData();
      return ResponseEntity.status(HttpStatus.OK).body(response);
    }catch (Exception e){
      log.error("센서 데이터 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * 기간별 센서 이력 조회
   * @param start 시작일 (yyyy-MM-dd)
   * @param end 종료일 (yyyy-MM-dd)
   */
  @GetMapping("/history")
  public ResponseEntity<?> getSensorHistory(
          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate start,
          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate end
          ) {
    try {
      SensorHistoryResponseDTO response = sensorService.getSensorHistory(start, end);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      log.error("센서 이력 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
