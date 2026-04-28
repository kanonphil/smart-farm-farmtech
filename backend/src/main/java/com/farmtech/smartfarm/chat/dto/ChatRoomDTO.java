package com.farmtech.smartfarm.chat.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatRoomDTO {
  private int roomId;
  private int memberId;
  private String memberName;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String lastMessage;
}