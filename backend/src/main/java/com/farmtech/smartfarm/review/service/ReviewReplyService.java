package com.farmtech.smartfarm.review.service;

import com.farmtech.smartfarm.notification.service.NotificationService;
import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.dto.ReviewReplyDTO;
import com.farmtech.smartfarm.review.mapper.ReviewMapper;
import com.farmtech.smartfarm.review.mapper.ReviewReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewReplyService {

  private final ReviewReplyMapper reviewReplyMapper;
  private final GeminiReviewService geminiReviewService;
  private final ReviewMapper reviewMapper;
  private final NotificationService notificationService;

  /**
   * 답글 등록/수정 (upsert)
   * 기존 답글이 없으면 신규 등록 후 리뷰 작성자에게 알림 발송,
   * 기존 답글이 있으면 수정만 수행 (알림 없음)
   */
  public void saveReply(ReviewReplyDTO dto) {
    ReviewReplyDTO existing = reviewReplyMapper.getReplyByReviewId(dto.getReviewId());
    if (existing == null) {
      reviewReplyMapper.insertReply(dto);
      // 신규 답글: 리뷰 작성자에게 알림 발송
      ReviewDTO review = reviewMapper.getReviewById(dto.getReviewId());
      if (review != null) {
        notificationService.createNotification(
                review.getMemberId(),
                "내 리뷰에 판매자 답글이 달렸습니다.",
                "/mypage/reviews?tab=written&reviewId=" + dto.getReviewId()
        );
      }
    } else {
      reviewReplyMapper.updateReply(existing.getReplyId(), dto.getContent());
    }
  }

  /** 답글 삭제 */
  public void deleteReply(int replyId) {
    reviewReplyMapper.deleteReply(replyId);
  }

  /** 리뷰 ID로 답글 조회 */
  public ReviewReplyDTO getReplyByReviewId(int reviewId) {
    return reviewReplyMapper.getReplyByReviewId(reviewId);
  }

  /**
   * Gemini 답글 초안 생성
   *
   * @param rating  리뷰 별점
   * @param content 리뷰 내용
   * @return 초안 문자열
   */
  public String generateDraft(int rating, String content) {
    return geminiReviewService.generateReplyDraft(rating, content);
  }
}
