package com.farmtech.smartfarm.review.mapper;

import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.dto.UnreviewedItemDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

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

  //고객 리뷰 조회 메서드
  List<ReviewDTO> selectReviewCustomer (@Param("size")int size ,@Param("offset")int offset);

  //고객 평균평점, 주문수, 7일, 30일 조회
  Map<String,Object> ratingAndReviews();

  //해당상품 리뷰 평점들, 카운트
  Map<String,Object> countAndRating(@Param("productId")int productId);

  /** 전체 리뷰 목록 조회 (매니저용, 상품명·회원명 포함, 최신순) */
  List<ReviewDTO> getAllReviewsForManager();

  /** 매니저 권한 리뷰 삭제 (memberId 검증 없음) */
  void deleteReviewByManager(@Param("reviewId") int reviewId);

  /** 리뷰 노출 상태 변경 (VISIBLE ↔ BLINDED) */
  void updateReviewStatus(@Param("reviewId") int reviewId, @Param("status") String status);

  /**
   * ORDER_ITEM_ID가 해당 회원의 구매 확정(DONE) 주문에 속하는지 검증
   *
   * @param orderItemId 검증할 주문 상품 ID
   * @param memberId    요청 회원 ID
   * @return 본인의 DONE 주문 상품이면 true
   */
  boolean isOrderItemOwnedByMember(@Param("orderItemId") int orderItemId,
                                   @Param("memberId") int memberId);

}
