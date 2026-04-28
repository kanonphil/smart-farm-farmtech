package com.farmtech.smartfarm.chat.mapper;

import com.farmtech.smartfarm.chat.dto.ChatMessageDTO;
import com.farmtech.smartfarm.chat.dto.ChatRoomDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMapper {

  // 채팅방 생성
  void insertChatRoom(ChatRoomDTO dto);

  // 회원 ID로 채팅방 조회
  ChatRoomDTO selectRoomByMemberId(int memberId);

  // roomId로 채팅방 조회
  ChatRoomDTO selectRoomById(int roomId);

  // 전체 채팅방 목록 (매니저용)
  List<ChatRoomDTO> selectAllRooms();

  // 채팅방 상태 변경 (OPEN / CLOSED)
  void updateRoomStatus(@Param("roomId") int roomId, @Param("status") String status);

  // 메시지 저장
  void insertMessage(ChatMessageDTO dto);

  // 채팅방 메시지 전체 조회
  List<ChatMessageDTO> selectMessagesByRoomId(int roomId);
}