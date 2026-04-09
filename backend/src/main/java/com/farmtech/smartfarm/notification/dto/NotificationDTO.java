package com.farmtech.smartfarm.notification.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 알림 데이터 전송 객체
 */
@Getter
@Setter
public class NotificationDTO {
  private int notificationId;
  private int memberId;
  private String message;
  private String link;
  private boolean isRead;
  private LocalDateTime createdAt;
}
