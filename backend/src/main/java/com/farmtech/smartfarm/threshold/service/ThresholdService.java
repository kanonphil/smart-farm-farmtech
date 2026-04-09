package com.farmtech.smartfarm.threshold.service;

import com.farmtech.smartfarm.threshold.dto.ThresholdPresetDTO;
import com.farmtech.smartfarm.threshold.mapper.ThresholdMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
public class ThresholdService {
  private final ThresholdMapper thresholdMapper;
  private final RestTemplate restTemplate;
  private final String IOT_URL = "http://192.168.30.235:8000";

  public ThresholdService(ThresholdMapper thresholdMapper) {
    this.thresholdMapper = thresholdMapper;
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(3000);  // 연결 시도 최대 3초
    factory.setReadTimeout(3000);     // 응답 대기 최대 3초
    this.restTemplate = new RestTemplate(factory);
  }

  // 전체 프리셋 목록 반환
  public List<ThresholdPresetDTO> getAllPreset() {
    return thresholdMapper.getAllPresets();
  }

  // 현재 활성화된 프리셋 반환
  public ThresholdPresetDTO getActivatePreset() {
    return thresholdMapper.getActivePreset();
  }

  // 새 프리셋 생성
  public void createPreset(ThresholdPresetDTO dto) {
    thresholdMapper.insertPreset(dto);
  }

  // 프리셋 수정
  public void updatePreset(ThresholdPresetDTO dto) {
    thresholdMapper.updatePreset(dto);
  }

  // 프리셋 삭제
  public void deletePreset(int id) {
    thresholdMapper.deletePreset(id);
  }

  // 프리셋 활성화: 기존 active를 모두 해제 후 선택한 프리셋만 활성화
  // 두 쿼리가 하나의 트랜잭션으로 처리되어야 IS_ACTIVE=1인 row가 항상 1개 보장됨
  @Transactional
  public void activatePreset(int id) {
    thresholdMapper.deactivateAll();
    thresholdMapper.activatePreset(id);
  }

  @Async
  public void notifyIoTServer() {
    try {
      restTemplate.postForObject(IOT_URL + "/threshold/reload", null, String.class);
    } catch (Exception e) {
      log.warn("IoT 서버 임계값 갱신 알림 실패: {}", e.getMessage());
    }
  }
}
