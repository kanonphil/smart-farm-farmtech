package com.farmtech.smartfarm.sensor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SensorReceiveDTO {
  // 온습도 데이터
  private Double temperature;
  private Double humidity;
  private Boolean dhtFanOn;

  // 조도 데이터
  private Double lightValue;
  private Boolean ledOn;

  // 대기질 데이터
  private Integer rawValue;
  private Double airPpm;
  private Boolean airFanOn;

  // 모션 데이터 (PIR 센서)
  private Boolean motionDetected;
  private Boolean buzzerOn;
}
