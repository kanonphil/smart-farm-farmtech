package com.farmtech.smartfarm.threshold.mapper;

import com.farmtech.smartfarm.threshold.dto.ThresholdPresetDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ThresholdMapper {
  // 전체 프리셋 목록 조회
  List<ThresholdPresetDTO> getAllPresets();
  // 현재 활성화된 프리셋 1개 조회 (IoT에서 임계값 읽을 때 사용)
  ThresholdPresetDTO getActivePreset();
  // 새 프리셋 추가
  void insertPreset(ThresholdPresetDTO dto);
  // 프리셋 수정
  void updatePreset(ThresholdPresetDTO dto);
  // 프리셋 삭제
  void deletePreset(int id);
  // 모든 프리셋 비활성화 (활성화 전 초기화용)
  void deactivateAll();
  // 특정 프리셋 활성화
  void activatePreset(int id);
}
