package com.farmtech.smartfarm.notification.service;

import com.farmtech.smartfarm.member.mapper.MemberMapper;
import com.farmtech.smartfarm.notification.dto.NotificationDTO;
import com.farmtech.smartfarm.notification.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 알림 비즈니스 로직 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
  private final NotificationMapper notificationMapper;
  private final SseEmitterService sseEmitterService;
  private final FcmService fcmService;
  private final MemberMapper memberMapper;

  /**
   * 알림 생성 및 실시간 전송
   * DB에 저장 후 회원이 SSE 연결 중이면 즉시 push
   *
   * @param memberId 수신 회원 ID
   * @param message 알림 내용
   * @param link 클릭 시 이동 경로
   */
  public void createNotification(int memberId, String message, String link) {
    NotificationDTO dto = new NotificationDTO();
    dto.setMemberId(memberId);
    dto.setMessage(message);
    dto.setLink(link);

    // DB 저장 (온/오프라인 무관하게 항상 저장)
    notificationMapper.insertNotification(dto);

    // SSE 연결 중이면 실시간 전송
    sseEmitterService.sendToMember(memberId, dto);

    // FCM 발송 (추가)
    String fcmToken = memberMapper.selectFcmToken(memberId);
    fcmService.sendToDevice(fcmToken, "한우마루", message);
  }

  /**
   * 안 읽은 알림 목록 조회
   * 페이지 진입 시 오프라인 동안 쌓인 알림 불러올 때 사용
   */
  public List<NotificationDTO> getUnread(int memberId) {
    return notificationMapper.selectUnreadNotifications(memberId);
  }

  /**
   * 알림 읽음 처리
   */
  public void markAsRead(int notificationId) {
    notificationMapper.updateMarkAsRead(notificationId);
  }
}
