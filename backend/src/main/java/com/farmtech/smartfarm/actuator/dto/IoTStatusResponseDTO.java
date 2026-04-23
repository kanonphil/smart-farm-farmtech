package com.farmtech.smartfarm.actuator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * IoT 실시간 상태 통합 응답 DTO
 *
 * source 값에 따라 데이터 출처가 달라집니다.
 *  LIVE - 라즈베리파이에서 직접 조회한 실시간 값
 *  DB_FALLBACK - Pi 연결 실패, DB에 저장된 마지막 값
 *  DB_ERROR - Pi 연결 실패 + DB도 연결 불가 (data 전부 null)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IoTStatusResponseDTO {
    /**
     * 데이터 출처
     * "LIVE" | "DB_FALLBACK" | "DB_ERROR"
     */
    private String source;

    // ── 센서 값 (LIVE, DB_FALLBACK 공통) ──────────────
    /** 온도 (°C) */
    private Double temperature;
    /** 습도 (%) */
    private Double humidity;
    /** 조도 (lux) */
    private Double lux;
    /** 대기질 원시값 */
    private Integer airRaw;

    // ── 액추에이터 상태 (LIVE 전용, DB_FALLBACK은 null) ─
    /** LED ON 여부 */
    private Boolean ledOn;
    /** LED 밝기 (0.0 ~ 1.0) */
    private Double ledBrightness;
    /** 팬 ON 여부 */
    private Boolean fanOn;
    /** 팬 속도 (0.0 ~ 1.0) */
    private Double fanSpeed;
    /** 부저 ON 여부 */
    private Boolean buzzerOn;
    /** 부저 주파수 (Hz) */
    private Integer buzzerFreq;

    /** 제어 모드 — "auto" | "manual" (LIVE 전용) */
    private String mode;
}
