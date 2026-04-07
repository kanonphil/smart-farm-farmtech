package com.farmtech.smartfarm.review.mapper;

import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.dto.UnreviewedItemDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReviewMapper {
  // 리뷰 등록
  void insertReview(ReviewDTO reviewDTO);
  // 해당 주문 상품에 이미 리뷰가 존재하는지 확인
  boolean existsByOrderItemId(@Param("orderItemId") int orderItemId);
  // 특정 상품의 전체 리뷰 목록 조회
  List<ReviewDTO> getReviewsByProductId(@Param("productId") int productId);
  // 주문 상품 ID로 상품 ID 조회
  int getProductIdByOrderItemId(@Param("orderItemId") int orderItemId);
  // 작성한 리뷰 조회 메서드
  List<ReviewDTO> getMyReviews(@Param("memberId") int memberId,
                               @Param("startDate") String startDate,
                               @Param("endDate") String endDate);
  //아직 작성하지 않은 리뷰 조회 메서드
  List<UnreviewedItemDTO> getUnreviewedOrderItems(@Param("memberId") int memberId,
                                                  @Param("startDate") String startDate,
                                                  @Param("endDate") String endDate);

  //리뷰 수정 메서드
  void updateReview(ReviewDTO reviewDTO);

  //리뷰 삭제 메서드
  void deleteReview(@Param("reviewId") int reviewId, @Param("memberId") int memberId);


}
