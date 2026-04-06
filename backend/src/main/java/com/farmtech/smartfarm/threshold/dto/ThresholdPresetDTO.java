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
  private double tempLow;
  private double tempHigh;
  private double humLow;
  private double humHigh;
  private int airPpmLow;
  private int airPpmBad;
  private int luxLow;
  private int luxHigh;
  private boolean isActive;
  private LocalDateTime createdAt;
}
