package com.farmtech.smartfarm.sensor.service;

import com.farmtech.smartfarm.sensor.dto.SensorHistoryResponseDTO;
import com.farmtech.smartfarm.sensor.dto.SensorResponseDTO;
import com.farmtech.smartfarm.sensor.mapper.SensorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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

  /**
   * 기간별 센서 이력 조회
   * @param start 시작일
   * @param end 종료일
   */
  public SensorHistoryResponseDTO getSensorHistory(LocalDate start, LocalDate end) {
    SensorHistoryResponseDTO response = new SensorHistoryResponseDTO();
    response.setDht(sensorMapper.getDhtHistory(start, end));
    response.setLight(sensorMapper.getLightHistory(start, end));
    response.setAir(sensorMapper.getAirHistory(start, end));
    return response;
  }
}
