package com.farmtech.smartfarm.alert.mapper;

import com.farmtech.smartfarm.alert.dto.AlertDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AlertMapper {
  // 알림 이력 조회 (최근 100번)
  List<AlertDTO> getAlerts();
}
