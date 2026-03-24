package com.farmtech.smartfarm.sensor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class SensorResponseDTO { //데이터를 한번에 조회하기 위해 만든 DTO
  private SensorDTO air;
  private List<SensorDTO> dht;
  private SensorDTO light;
}
