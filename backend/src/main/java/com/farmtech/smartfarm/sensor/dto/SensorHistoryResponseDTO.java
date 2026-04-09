package com.farmtech.smartfarm.sensor.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 기간별 센서 이력 응답 DTO
 */
@Getter
@Setter
public class SensorHistoryResponseDTO {
  private List<SensorDTO> dht;
  private List<SensorDTO> light;
  private List<SensorDTO> air;
}
