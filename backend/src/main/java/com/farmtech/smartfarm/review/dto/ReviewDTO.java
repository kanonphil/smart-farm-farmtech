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
}
