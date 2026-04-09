package com.farmtech.smartfarm.sensor.mapper;

import com.farmtech.smartfarm.sensor.dto.SensorDTO;
import com.farmtech.smartfarm.sensor.dto.SensorReceiveDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface SensorMapper {

  // 대기질 조회 메서드
  SensorDTO getAir();

  // 온도, 습도, 시간 조회 메서드
  List<SensorDTO> getDht();

  // 조도 조회 메서드
  SensorDTO getLight();

  // 기간별 온습도 이력 조회
  List<SensorDTO> getDhtHistory(@Param("start")LocalDate start,
                                @Param("end") LocalDate end);

  // 기간별 조도 이력 조회
  List<SensorDTO> getLightHistory(@Param("start")LocalDate start,
                                  @Param("end") LocalDate end);

  // 기간별 대기질 이력 조회
  List<SensorDTO> getAirHistory(@Param("start")LocalDate start,
                                @Param("end") LocalDate end);
}
