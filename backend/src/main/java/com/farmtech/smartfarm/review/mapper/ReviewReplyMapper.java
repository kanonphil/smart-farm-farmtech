package com.farmtech.smartfarm.review.mapper;

import com.farmtech.smartfarm.review.dto.ReviewReplyDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReviewReplyMapper {

  /** 답글 등록 */
  void insertReply(ReviewReplyDTO dto);

  /** 답글 수정 */
  void updateReply(@Param("replyId") int replyId, @Param("content") String content);

  /** 답글 삭제 */
  void deleteReply(@Param("replyId") int replyId);

  /** 리뷰 ID로 답글 조회 */
  ReviewReplyDTO getReplyByReviewId(@Param("reviewId") int reviewId);
}
