package com.farmtech.smartfarm.chat.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageDTO {
  private int messageId;
  private int roomId;
  private String senderRole;   // "MEMBER" or "MANAGER"
  private String content;
  private String messageType;
  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  private LocalDateTime createdAt;
}