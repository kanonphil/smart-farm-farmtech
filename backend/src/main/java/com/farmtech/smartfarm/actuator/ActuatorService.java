package com.farmtech.smartfarm.actuator;

import com.farmtech.smartfarm.jwt.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class ActuatorService {

    // application.properties 에서 라즈베리파이 IP 관리
    @Value("${raspberry.pi.url}")
    private String piUrl;  // 예: http://192.168.0.45:8000

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    // 서버 시작 시 생성된 디바이스 JWT (30일 유효)
    private String deviceToken;

    /**
     * 서버 시작 시 디바이스 JWT를 한 번 생성해서 캐싱함.
     * Pi의 verify_device_token이 이 토큰을 검증.
     */
    @PostConstruct
    public void initDeviceToken() {
        long thirtyDays = 1000L * 60 * 60 * 24 * 30;
        deviceToken = jwtUtil.createDeviceToken("raspberry-pi-001", thirtyDays);
        System.out.println("[ActuatorService] 디바이스 JWT 생성 완료");
    }

    /**
     * 25일마다 디바이스 토큰을 자동으로 재발급
     * (만료 30일 기준, 여유 5일 전에 갱신)
     */
    @Scheduled(fixedRate = 1000L * 60 * 60 * 24 * 25) // 25일 (ms)
    public void refreshDeviceToken() {
        deviceToken = jwtUtil.createDeviceToken(
                "raspberry-pi-001",
                1000L * 60 * 60 * 24 * 30
        );
        log.info("디바이스 토큰 자동 갱신 완료");
    }

    /**
     * Pi 요청에 공통으로 사용할 HTTP 헤더
     * Authorization: Bearer <device_jwt> 포함
     */
    private HttpHeaders deviceHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deviceToken);
        return headers;
    }

    // ── 공통 POST 요청 메서드 (디바이스 JWT 포함) ──────────────────────
    private Object post(String path, Object body) {
        HttpEntity<Object> entity = new HttpEntity<>(body, deviceHeaders());
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Object> res = restTemplate.exchange(
                    piUrl + path, HttpMethod.POST, entity, Object.class
            );
            return res.getBody();
        } catch (Exception e) {
            return Map.of("error", "라즈베리파이 연결 실패: " + e.getMessage());
        }
    }

    // ── GET 요청 (디바이스 JWT 포함) ───────────────────────────────────
    // 기존 getForObject() -> exchange()로 변경 (헤더 추가를 위해)
    private Object get(String path) {
        HttpEntity<Void> entity = new HttpEntity<>(deviceHeaders());
        try {
            ResponseEntity<Object> res = restTemplate.exchange(
                    piUrl + path, HttpMethod.GET, entity, Object.class
            );
//            return restTemplate.getForObject(piUrl + path, Object.class);
            return res.getBody();
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
