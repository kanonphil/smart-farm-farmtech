package com.farmtech.smartfarm.notification.controller;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.notification.service.NotificationService;
import com.farmtech.smartfarm.notification.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.awt.*;

/**
 * 알림 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;
  private final SseEmitterService sseEmitterService;

  /**
   * SSE 연결 엔드포인트
   * produces = TEXT_EVENT_STREAM_VALUE 가 핵심:
   * 일반 JSON 응답이 아닌 스트림 형식으로 응답한다고 선언
   *
   * EventSource는 헤더를 못 보내기 때문에 토큰을 쿼리 파라미터로 받음
   */
  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream(@AuthenticationPrincipal CustomUserDetails userDetails) {
    int memberId = userDetails.getMemberDTO().getMemberId();
    return sseEmitterService.subscribe(memberId);
  }

  /**
   * 안 읽은 알림 목록
   * 페이지 첫 진입 시 오프라인 동안 쌓인 알림 조회용
   */
  @GetMapping("/unread")
  public ResponseEntity<?> getUnread(@AuthenticationPrincipal CustomUserDetails userDetails) {
    int memberId = userDetails.getMemberDTO().getMemberId();
    return ResponseEntity.ok(notificationService.getUnread(memberId));
  }

  /**
   * 알림 읽음 처리
   */
  @PatchMapping("/{notificationId}/read")
  public ResponseEntity<?> markAsRead(@PathVariable int notificationId) {
    notificationService.markAsRead(notificationId);
    return ResponseEntity.ok().build();
  }
}
