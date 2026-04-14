package com.farmtech.smartfarm.review.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class ReviewDTO {
  private int reviewId;
  private int memberId;
  private String memberName;
  private int productId;
  private int orderItemId;
  private int rating;
  private String content;
  private LocalDateTime createdAt;
  private String productName;
  private int productPrice;
  private String imageUrl;
  private String imageSavedName;

  // 리뷰 노출 상태 (VISIBLE: 정상, BLINDED: 블라인드)
  private String status;

  // AI 분석 등급 (DB 저장, CLEAN / SUSPICIOUS / TOXIC)
  private String aiLabel;

  // 답글 존재 여부 (매니저 전체 리뷰 조회 시 포함, true: 답글 있음)
  private boolean hasReply;
}
