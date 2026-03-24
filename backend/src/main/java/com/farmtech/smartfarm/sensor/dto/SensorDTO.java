package com.farmtech.smartfarm.sensor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Setter
@Getter
@ToString
public class SensorDTO {
  private int rawValue;        // 대기질 (정수)
  private double temperature;    // 온도 (소수점 1자리)
  private double humidity;       // 습도 (소수점 1자리)
  private double lightValue;            // 조도 (소수점 2자리)
  private LocalDateTime recordedAt;      // 시간 (년/월/일 시/분/초)
}
