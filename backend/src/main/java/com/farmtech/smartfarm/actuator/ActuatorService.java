package com.farmtech.smartfarm.actuator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ActuatorService {

    // application.properties 에서 라즈베리파이 IP 관리
    @Value("${raspberry.pi.url}")
    private String piUrl;  // 예: http://192.168.0.45:8000

    @Autowired
    private RestTemplate restTemplate;

    // ── 공통 POST 요청 메서드 ──────────────────────
    private Object post(String path, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Object> res = restTemplate.exchange(
                    piUrl + path, HttpMethod.POST, entity, Object.class
            );
            return res.getBody();
        } catch (Exception e) {
            return Map.of("error", "라즈베리파이 연결 실패: " + e.getMessage());
        }
    }

    // ── GET 요청 ───────────────────────────────────
    private Object get(String path) {
        try {
            return restTemplate.getForObject(piUrl + path, Object.class);
        } catch (Exception e) {
            return Map.of("error", "라즈베리파이 연결 실패: " + e.getMessage());
        }
    }

    // ── 모드 전환 ──────────────────────────────────
    public Object getMode() {
        return get("/mode");
    }

    public Object setMode(String mode) {
        return post("/mode", Map.of("mode", mode));
    }

    // ── LED 제어 ───────────────────────────────────
    public Object ledOn(double brightness) {
        return post("/led/on", Map.of("brightness", brightness));
    }

    public Object ledOff() {
        return post("/led/off", null);
    }

    // ── 부저 제어 ──────────────────────────────────
    public Object buzzerOn(int freq) {
        return post("/buzzer/on", Map.of("freq", freq));
    }

    public Object buzzerOff() {
        return post("/buzzer/off", null);
    }

    // ── 팬 제어 ────────────────────────────────────
    public Object fanOn(double speed) {
      return post("/fan/on", Map.of("speed", speed));
    }

    public Object fanOff() {
      return post("/fan/off", null);
    }

    // ── 전체 상태 조회 ─────────────────────────────
    public Object getStatus() {
        return get("/status");
    }
}
