package com.farmtech.smartfarm.alert.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class AlertDTO {
  private int id;
  private String sensorType;
  private double value;
  private double threshold;
  private LocalDateTime createdAt;
}
