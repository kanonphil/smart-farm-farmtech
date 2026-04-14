package com.farmtech.smartfarm.review.service;

import com.farmtech.smartfarm.review.dto.ReviewReplyDTO;
import com.farmtech.smartfarm.review.mapper.ReviewReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewReplyService {

  private final ReviewReplyMapper reviewReplyMapper;
  private final GeminiReviewService geminiReviewService;

  /**
   * 답글 등록
   * 이미 답글이 존재하면 수정으로 처리 (upsert)
   */
  public void saveReply(ReviewReplyDTO dto) {
    ReviewReplyDTO existing = reviewReplyMapper.getReplyByReviewId(dto.getReviewId());
    if (existing == null) {
      reviewReplyMapper.insertReply(dto);
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
