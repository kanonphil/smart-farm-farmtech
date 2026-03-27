package com.farmtech.smartfarm.threshold.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ThresholdPresetDTO {
  private int id;
  private String name;
  private double tempHigh;
  private double humHigh;
  private int airPpmBad;
  private int luxHigh;
  private int luxLow;
  private boolean isActive;
  private LocalDateTime createdAt;
}
