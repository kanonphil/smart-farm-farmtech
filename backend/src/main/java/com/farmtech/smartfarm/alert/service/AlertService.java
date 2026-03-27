package com.farmtech.smartfarm.alert.service;

import com.farmtech.smartfarm.alert.dto.AlertDTO;
import com.farmtech.smartfarm.alert.mapper.AlertMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {
  private final AlertMapper alertMapper;

  public List<AlertDTO> getAlerts() {
    return alertMapper.getAlerts();
  }
}
