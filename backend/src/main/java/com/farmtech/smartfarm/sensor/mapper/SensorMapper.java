package com.farmtech.smartfarm.sensor.mapper;

import com.farmtech.smartfarm.sensor.dto.SensorDTO;
import com.farmtech.smartfarm.sensor.dto.SensorReceiveDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SensorMapper {

  // 대기질 조회 메서드
  SensorDTO getAir();

  // 온도, 습도, 시간 조회 메서드
  List<SensorDTO> getDht();

  // 조도 조회 메서드
  SensorDTO getLight();

  // 온습도 저장
  void insertDht(SensorReceiveDTO dto);

  // 조도 저장
  void insertLight(SensorReceiveDTO dto);

  // 대기질 저장

  // 모션 저장
}
