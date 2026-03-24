package com.farmtech.smartfarm.sensor.service;

import com.farmtech.smartfarm.sensor.dto.SensorResponseDTO;
import com.farmtech.smartfarm.sensor.mapper.SensorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class SensorService {
  private final SensorMapper sensorMapper;

  // 대기질, 조도, 최근 온,습도 10개의 데이터를 한번에 받을 기능
  public SensorResponseDTO getSensorData(){
    SensorResponseDTO response = new SensorResponseDTO();
    response.setAir(sensorMapper.getAir());
    response.setLight(sensorMapper.getLight());
    response.setDht(sensorMapper.getDht());
    return response;
  }
}
