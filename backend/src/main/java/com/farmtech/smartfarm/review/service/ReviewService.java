package com.farmtech.smartfarm.review.service;

import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.dto.UnreviewedItemDTO;
import com.farmtech.smartfarm.review.mapper.ReviewMapper;
import com.farmtech.smartfarm.util.UploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
  private final ReviewMapper reviewMapper;
  private final UploadUtil uploadUtil;
  /**
   * 리뷰 등록
   *
   * ORDER_ITEM_ID 기준으로 이미 작성된 리뷰가 있으면 예외를 던진다.
   * (한 주문 상품당 리뷰 1개만 허용)
   *
   * @param reviewDTO 등록한 리뷰 정보
   * @throws IllegalArgumentException 이미 리뷰가 존재할 경우
   */
  public void insertReview(ReviewDTO reviewDTO, MultipartFile imgFile)
  throws IOException {

    // 동일한 주문 상품에 대한 리뷰 중복 여부 확인
    if (reviewMapper.existsByOrderItemId(reviewDTO.getOrderItemId())) {
      throw new IllegalArgumentException("이미 리뷰를 작성하셨습니다.");
    }

    //이미지 등록
    if(imgFile != null && !imgFile.isEmpty()){
      ProductImageDTO img = uploadUtil.fileUpload(imgFile);
      reviewDTO.setImageUrl(img.getImageSavedName());
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

  //고객 리뷰 조회 기능
  public List<ReviewDTO> selectReviewCustomer(){return reviewMapper.selectReviewCustomer();}

  //고객 총 리뷰수, 평균평점, 7일, 30일(리뷰,평점)
  public Map<String,Object> ratingAndReviews(){return reviewMapper.ratingAndReviews();}
}
