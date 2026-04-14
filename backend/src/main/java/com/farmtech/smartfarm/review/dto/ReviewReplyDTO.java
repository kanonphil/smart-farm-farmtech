package com.farmtech.smartfarm.review.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewReplyDTO {
  private int replyId;
  private int reviewId;
  private String content;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
