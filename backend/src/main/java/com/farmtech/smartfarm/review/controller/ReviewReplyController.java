package com.farmtech.smartfarm.review.controller;

import com.farmtech.smartfarm.review.dto.ReviewReplyDTO;
import com.farmtech.smartfarm.review.service.ReviewReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reviews/{reviewId}/reply")
@RequiredArgsConstructor
public class ReviewReplyController {

  private final ReviewReplyService reviewReplyService;

  /**
   * 답글 조회 API
   * GET /reviews/{reviewId}/reply
   */
  @GetMapping
  public ResponseEntity<ReviewReplyDTO> getReply(@PathVariable int reviewId) {
    return ResponseEntity.ok(reviewReplyService.getReplyByReviewId(reviewId));
  }

  /**
   * 답글 등록/수정 API (매니저 전용)
   * POST /reviews/{reviewId}/reply
   */
  @PostMapping
  public ResponseEntity<?> saveReply(
          @PathVariable int reviewId,
          @RequestBody Map<String, String> body) {
    ReviewReplyDTO dto = new ReviewReplyDTO();
    dto.setReviewId(reviewId);
    dto.setContent(body.get("content"));
    reviewReplyService.saveReply(dto);
    return ResponseEntity.ok().build();
  }

  /**
   * 답글 삭제 API (매니저 전용)
   * DELETE /reviews/{reviewId}/reply/{replyId}
   */
  @DeleteMapping("/{replyId}")
  public ResponseEntity<?> deleteReply(@PathVariable int replyId) {
    reviewReplyService.deleteReply(replyId);
    return ResponseEntity.ok().build();
  }

  /**
   * Gemini 답글 초안 생성 API (매니저 전용)
   * POST /reviews/{reviewId}/reply/draft
   */
  @PostMapping("/draft")
  public ResponseEntity<Map<String, String>> generateDraft(
          @RequestBody Map<String, Object> body) {
    int rating = (int) body.get("rating");
    String content = (String) body.get("content");
    String draft = reviewReplyService.generateDraft(rating, content);
    return ResponseEntity.ok(Map.of("draft", draft));
  }
}
