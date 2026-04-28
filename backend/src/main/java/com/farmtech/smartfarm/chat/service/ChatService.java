package com.farmtech.smartfarm.chat.service;

import com.farmtech.smartfarm.chat.dto.ChatMessageDTO;
import com.farmtech.smartfarm.chat.dto.ChatRoomDTO;
import com.farmtech.smartfarm.chat.mapper.ChatMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

  private final ChatMapper chatMapper;
  private final SimpMessagingTemplate messagingTemplate;

  // 채팅방 생성 또는 기존 방 반환
  public ChatRoomDTO openOrGetRoom(int memberId) {
    ChatRoomDTO existing = chatMapper.selectRoomByMemberId(memberId);
    if (existing == null || "CLOSED".equals(existing.getStatus())) {
      ChatRoomDTO newRoom = new ChatRoomDTO();
      newRoom.setMemberId(memberId);
      chatMapper.insertChatRoom(newRoom);
      return chatMapper.selectRoomById(newRoom.getRoomId());
    }
    return existing;
  }

  // 메시지 저장 + 실시간 브로드캐스트
  public ChatMessageDTO saveAndSend(ChatMessageDTO dto) {
    chatMapper.insertMessage(dto);
    chatMapper.updateRoomStatus(dto.getRoomId(), "OPEN");

    // 해당 채팅방 구독자들에게 실시간 전송
    messagingTemplate.convertAndSend("/topic/chat/" + dto.getRoomId(), dto);
    log.info("[CHAT] 메시지 전송 - roomId: {}, role: {}", dto.getRoomId(), dto.getSenderRole());
    return dto;
  }

  // 메시지 이력 조회
  public List<ChatMessageDTO> getMessages(int roomId) {
    return chatMapper.selectMessagesByRoomId(roomId);
  }

  // 전체 채팅방 목록 (매니저용)
  public List<ChatRoomDTO> getAllRooms() {
    return chatMapper.selectAllRooms();
  }

  // 채팅방 종료
  public void closeRoom(int roomId) {
    chatMapper.updateRoomStatus(roomId, "CLOSED");

    // 앱에 종료 이벤트 전송
    ChatMessageDTO closeEvent = new ChatMessageDTO();
    closeEvent.setRoomId(roomId);
    closeEvent.setMessageType("CLOSE");
    closeEvent.setSenderRole("MANAGER");
    closeEvent.setContent("문의가 종료되었습니다.");
    messagingTemplate.convertAndSend("/topic/chat/" + roomId, closeEvent);
  }
}