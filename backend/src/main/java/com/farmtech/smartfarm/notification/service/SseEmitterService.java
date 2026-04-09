package com.farmtech.smartfarm.notification.service;

import com.farmtech.smartfarm.notification.dto.NotificationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 일반 HTTP 요청:
 *   클라이언트 → 요청 → 서버
 *   클라이언트 ← 응답 ← 서버  (연결 끊김)
 *
 * Polling (기존 방식):
 *   클라이언트 → 30초마다 계속 요청 → 서버
 *   클라이언트 ← 응답 ← 서버  (연결 끊김, 반복)
 *
 * SSE:
 *   클라이언트 → 연결 1번 → 서버
 *   클라이언트 ←── 이벤트 push ──← 서버  (연결 유지)
 *   클라이언트 ←── 이벤트 push ──← 서버  (유지)
 *   클라이언트 ←── 이벤트 push ──← 서버  (유지)
 *
 * 클라이언트가 연결을 한 번만 열면, 서버가 이벤트가 생길 때만 데이터를 밀어준다.
 * 연결이 끊기면 브라우저가 자동 재연결.
 *
 * Spring에서는 SseEmitter 객체가 이 연결을 대표.
 * 컨트롤러에서 SseEmitter를 반환하면 HTTP 응답이 닫히지 않고 유지되고,
 * emitter.send()를 호출할 때마다 클라이언트로 데이터가 전송.
 *
 * SSE 연결 관리 서비스
 *
 * ConcurrentHashMap으로 memberId별 SseEmitter를 보관.
 * 여러 요청이 동시에 map에 접근해도 안전하도록 ConcurrentHashMap 사용.
 */
@Slf4j
@Service
public class SseEmitterService {
  /**
   * 현재 SSE 연결 중인 회원들의 emitter 저장소
   * key: memberId, value: SseEmitter
   */
  private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

  /**
   * SSE 구독 - 클라이언트가 /notifications/stream 호출 시 실행
   * SseEmitter를 생성하고 반환하면 HTTP 연결이 닫히지 않고 유지됨.
   *
   * @param memberId 로그인한 회원 ID
   * @return SseEmitter (연결 유지 객체)
   */
  public SseEmitter subscribe(int memberId) {
    // Long.MAX_VALUE: 연결 타임아웃을 사실상 무제한으로 설정
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

    emitters.put(memberId, emitter);
    log.info("[SSE] 연결 - memberId: {}", memberId);

    // 연결 정상 종료 시 map에서 제거
    emitter.onCompletion(() -> {
      emitters.remove(memberId);
      log.info("[SSE] 연결 종료 - memberId: {}", memberId);
    });

    // 타임아웃 시 map에서 제거
    emitter.onTimeout(() -> {
      emitters.remove(memberId);
      log.info("[SSE] 연결 타임아웃 - memberId: {}", memberId);
    });

    // 에러 발생 시 map에서 제거
    emitter.onError(e -> {
      emitters.remove(memberId);
      log.warn("[SSE] 연결 에러 - memberId: {}", memberId);
    });

    // 최초 연결 시 더미 이벤트 전송
    // 브라우저는 첫 이벤트를 받아야 연결이 확립됐다고 인식함
    try {
      emitter.send(SseEmitter.event()
              .name("connect")
              .data("connected"));
    } catch (IOException e) {
      emitters.remove(memberId);
    }

    return emitter;
  }

  /**
   * 특정 회원에게 알림 이벤트 전송
   * 해당 회원이 SSE 연결 중일 때만 전송 (오프라인이면 DB에만 저장됨)
   *
   * @param memberId 수신 대상 회원 ID
   * @param dto 전송할 알림 데이터
   */
  public void sendToMember(int memberId, NotificationDTO dto) {
    SseEmitter emitter = emitters.get(memberId);

    if (emitter == null) {
      log.info("[SSE] 대상 오프라인 - memberId: {} (DB에만 저장)", memberId);
      return;
    }

    try {
      emitter.send(SseEmitter.event()
              .name("notification")   // 프론트에서 이 이름으로 이벤트 구독
              .data(dto));
      log.info("[SSE] 알림 전송 완료 - memberId: {}", memberId);
    } catch (IOException e) {
      emitters.remove(memberId);
      log.warn("[SSE] 알림 전송 실패 - memberId: {}", memberId);
    }
  }
}
