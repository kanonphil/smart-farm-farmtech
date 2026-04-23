package com.farmtech.smartfarm.actuator.controller;

import com.farmtech.smartfarm.actuator.dto.IoTStatusResponseDTO;
import com.farmtech.smartfarm.actuator.service.ActuatorService;
import com.farmtech.smartfarm.sensor.dto.SensorResponseDTO;
import com.farmtech.smartfarm.sensor.service.SensorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/actuator")
public class ActuatorController {

    @Autowired
    private ActuatorService actuatorService;

    @Autowired
    private SensorService sensorService;

    // ── 모드 조회 / 전환 ───────────────────────────
    @GetMapping("/mode")
    public ResponseEntity<?> getMode() {
        return ResponseEntity.ok(actuatorService.getMode());
    }

    @PostMapping("/mode")
    public ResponseEntity<?> setMode(@RequestParam String mode) {
        return ResponseEntity.ok(actuatorService.setMode(mode));
    }

    // ── LED 제어 ───────────────────────────────────
    @PostMapping("/led/on")
    public ResponseEntity<?> ledOn(
            @RequestParam(defaultValue = "1.0") double brightness) {
        return ResponseEntity.ok(actuatorService.ledOn(brightness));
    }

    @PostMapping("/led/off")
    public ResponseEntity<?> ledOff() {
        return ResponseEntity.ok(actuatorService.ledOff());
    }

    // ── 부저 제어 ──────────────────────────────────
    @PostMapping("/buzzer/on")
    public ResponseEntity<?> buzzerOn(
            @RequestParam(defaultValue = "440") int freq) {
        return ResponseEntity.ok(actuatorService.buzzerOn(freq));
    }

    @PostMapping("/buzzer/off")
    public ResponseEntity<?> buzzerOff() {
        return ResponseEntity.ok(actuatorService.buzzerOff());
    }

    // ── 팬 제어 ────────────────────────────────────
    @PostMapping("/fan/on")
    public ResponseEntity<?> fanOn(@RequestParam(defaultValue = "1.0") double speed) {
      return ResponseEntity.ok(actuatorService.fanOn(speed));
    }

    @PostMapping("/fan/off")
    public ResponseEntity<?> fanOff() {
      return ResponseEntity.ok(actuatorService.fanOff());
    }

    // ── 전체 상태 조회 (Pi → DB 폴백 → DB 오류) ────

    /**
     * IoT 전체 상태 조회
     *
     * 1. Pi에서 실시간 데이터 조회를 시도
     * 2. Pi 연결 실패 시 DB의 마지막 저장값으로 폴백
     * 3. DB도 연결 불가 시 HTTP 503을 반환
     *
     * 응답의 source 필드로 클라이언트가 출처를 판단
     *   LIVE -> 실시간 Pi 데이터
     *   DB_FALLBACK -> DB 마지막 저장값 (액추에이터 상태 없음)
     *   DB_ERROR -> 503, 모든 data null
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {

        // ── Step 1: Pi 실시간 조회 ────────────────────────────────
        Object piResult = actuatorService.getStatus();

        boolean piOnline = !(piResult instanceof Map
                && ((Map<?, ?>) piResult).containsKey("error"));

        if (piOnline) {
            try {
                @SuppressWarnings("onchecked")
                IoTStatusResponseDTO response = buildFromPiResponse(
                        (Map<String, Object>) piResult
                );
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                log.error("Pi 응답 파싱 오류", e);
                // 파싱 실패도 Pi 오프라인으로 처리
            }
        }


        // ── Step 2: Pi 오프라인 → DB 폴백 ────────────────────────
        log.warn("Pi 연결 실패 — DB 폴백으로 전환");
        try {
            SensorResponseDTO dbData = sensorService.getSensorData();
            IoTStatusResponseDTO response = buildFromDbFallback(dbData);
            return ResponseEntity.ok(response);
        } catch (Exception dbEx) {
            // ── Step 3: DB도 연결 불가 ────────────────────────────
            log.error("DB 연결 실패", dbEx);
            return ResponseEntity.status(503)
                    .body(IoTStatusResponseDTO.builder()
                            .source("DB_ERROR")
                            .build());
        }
    }

    // ── 헬퍼: Pi 응답 → DTO ───────────────────────────────────────

    /**
     * Pi의 /status 응답(Map)을 IoTStatusResponseDTO로 변환합니다.
     */
    @SuppressWarnings("unchecked")
    private IoTStatusResponseDTO buildFromPiResponse(Map<String, Object> pi) {
        Map<String, Object> sensor  = (Map<String, Object>) pi.getOrDefault("sensor",  Map.of());
        Map<String, Object> led     = (Map<String, Object>) pi.getOrDefault("led",     Map.of());
        Map<String, Object> fan     = (Map<String, Object>) pi.getOrDefault("fan",     Map.of());
        Map<String, Object> buzzer  = (Map<String, Object>) pi.getOrDefault("buzzer",  Map.of());

        return IoTStatusResponseDTO.builder()
                .source("LIVE")
                .temperature(toDouble(sensor.get("temperature")))
                .humidity(toDouble(sensor.get("humidity")))
                .lux(toDouble(sensor.get("lux")))
                .airRaw(toInteger(sensor.get("air_raw")))
                .ledOn((Boolean)  led.getOrDefault("is_on", false))
                .ledBrightness(toDouble(led.get("brightness")))
                .fanOn((Boolean)  fan.getOrDefault("is_on", false))
                .fanSpeed(toDouble(fan.get("speed")))
                .buzzerOn((Boolean) buzzer.getOrDefault("is_on", false))
                .buzzerFreq(toInteger(buzzer.get("freq")))
                .mode((String) pi.getOrDefault("mode", "auto"))
                .build();
    }

    // ── 헬퍼: DB 응답 → DTO ──────────────────────────────────────

    /**
     * DB의 SensorResponseDTO를 IoTStatusResponseDTO로 변환합니다.
     * 액추에이터 상태와 모드는 DB에 없으므로 null로 설정합니다.
     */
    private IoTStatusResponseDTO buildFromDbFallback(SensorResponseDTO db) {
        Double temperature = null, humidity = null;
        // dht 목록의 첫 번째(가장 최근) 데이터 사용
        if (db.getDht() != null && !db.getDht().isEmpty()) {
            temperature = db.getDht().get(0).getTemperature();
            humidity    = db.getDht().get(0).getHumidity();
        }
        Double  lux    = db.getLight() != null ? db.getLight().getLightValue() : null;
        Integer airRaw = db.getAir()   != null ? db.getAir().getRawValue()     : null;

        return IoTStatusResponseDTO.builder()
                .source("DB_FALLBACK")
                .temperature(temperature)
                .humidity(humidity)
                .lux(lux)
                .airRaw(airRaw)
                // 액추에이터 상태는 null (DB에 현재 상태 없음)
                .build();
    }

    // ── 타입 변환 유틸 ─────────────────────────────────────────────

    private Double toDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Double)  return (Double) v;
        if (v instanceof Integer) return ((Integer) v).doubleValue();
        if (v instanceof Number)  return ((Number) v).doubleValue();
        return null;
    }

    private Integer toInteger(Object v) {
        if (v == null) return null;
        if (v instanceof Integer) return (Integer) v;
        if (v instanceof Number)  return ((Number) v).intValue();
        return null;
    }
}
