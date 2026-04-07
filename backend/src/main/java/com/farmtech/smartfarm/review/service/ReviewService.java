package com.farmtech.smartfarm.review.service;

import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.dto.UnreviewedItemDTO;
import com.farmtech.smartfarm.review.mapper.ReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
  private final ReviewMapper reviewMapper;

  /**
   * 리뷰 등록
   *
   * ORDER_ITEM_ID 기준으로 이미 작성된 리뷰가 있으면 예외를 던진다.
   * (한 주문 상품당 리뷰 1개만 허용)
   *
   * @param reviewDTO 등록한 리뷰 정보
   * @throws IllegalArgumentException 이미 리뷰가 존재할 경우
   */
  public void insertReview(ReviewDTO reviewDTO) {
    // 동일한 주문 상품에 대한 리뷰 중복 여부 확인
    if (reviewMapper.existsByOrderItemId(reviewDTO.getOrderItemId())) {
      throw new IllegalArgumentException("이미 리뷰를 작성하셨습니다.");
    }

    // orderItemId로 productId 서버에서 직접 조회 (프론트 의존 제거)
    int productId = reviewMapper.getProductIdByOrderItemId(reviewDTO.getOrderItemId());
    reviewDTO.setProductId(productId);

    reviewMapper.insertReview(reviewDTO);
  }

  /**
   * 특정 상품의 리뷰 목록 조회
   *
   * @param productId 상품 ID
   * @return 리뷰 목록 (최신순)
   */
  public List<ReviewDTO> getReviewsByProductId(int productId) {
    return reviewMapper.getReviewsByProductId(productId);
  }

  // 작성한 리븆 조회 기능
  public List<ReviewDTO> getMyReviews(int memberId, String startDate, String endDate) {
    return reviewMapper.getMyReviews(memberId, startDate, endDate);
  }
  // 아직 작성하지 않은 리뷰 조회 기능
  public List<UnreviewedItemDTO> getUnreviewedOrderItems(int memberId, String startDate, String endDate) {
    return reviewMapper.getUnreviewedOrderItems(memberId, startDate, endDate);
  }

  //리뷰 수정 기능
  public void updateReview(ReviewDTO reviewDTO) {
    reviewMapper.updateReview(reviewDTO);
  }

  //리뷰 삭제 기능
  public void deleteReview(int reviewId, int memberId) {
    reviewMapper.deleteReview(reviewId, memberId);
  }
}
