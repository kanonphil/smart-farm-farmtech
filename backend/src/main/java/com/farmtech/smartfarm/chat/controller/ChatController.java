package com.farmtech.smartfarm.chat.controller;

import com.farmtech.smartfarm.chat.dto.ChatMessageDTO;
import com.farmtech.smartfarm.chat.dto.ChatRoomDTO;
import com.farmtech.smartfarm.chat.service.ChatService;
import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

  private final ChatService chatService;

  // ── STOMP: 메시지 전송 ──────────────────────────
  // 클라이언트가 /app/chat.send 로 발행하면 실행
  @MessageMapping("/chat.send")
  public void sendMessage(@Payload ChatMessageDTO dto) {
    chatService.saveAndSend(dto);
  }

  // ── REST: 채팅방 생성 또는 조회 ─────────────────
  // POST /chat/rooms
  @PostMapping("/chat/rooms")
  public ResponseEntity<ChatRoomDTO> openRoom(
          @AuthenticationPrincipal CustomUserDetails userDetails) {
    int memberId = userDetails.getMemberDTO().getMemberId();
    return ResponseEntity.ok(chatService.openOrGetRoom(memberId));
  }

  // ── REST: 메시지 이력 조회 ───────────────────────
  // GET /chat/rooms/{roomId}/messages
  @GetMapping("/chat/rooms/{roomId}/messages")
  public ResponseEntity<List<ChatMessageDTO>> getMessages(
          @PathVariable int roomId) {
    return ResponseEntity.ok(chatService.getMessages(roomId));
  }

  // ── REST: 전체 채팅방 목록 (매니저용) ───────────
  // GET /chat/rooms
  @GetMapping("/chat/rooms")
  public ResponseEntity<List<ChatRoomDTO>> getAllRooms() {
    return ResponseEntity.ok(chatService.getAllRooms());
  }

  // ── REST: 채팅방 종료 (매니저용) ────────────────
  // PATCH /chat/rooms/{roomId}/close
  @PatchMapping("/chat/rooms/{roomId}/close")
  public ResponseEntity<Void> closeRoom(@PathVariable int roomId) {
    chatService.closeRoom(roomId);
    return ResponseEntity.ok().build();
  }
}