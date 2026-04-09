package com.farmtech.smartfarm.notification.mapper;

import com.farmtech.smartfarm.notification.dto.NotificationDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 알림 MyBatis 매퍼 인터페이스
 */
@Mapper
public interface NotificationMapper {
  // 알림 저장
  void insertNotification(NotificationDTO dto);

  // 안 읽은 알림 저장
  List<NotificationDTO> selectUnreadNotifications(int memberId);

  // 읽음 처림
  void updateMarkAsRead(int notificationId);
}
