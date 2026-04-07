package com.farmtech.smartfarm.review.mapper;

import com.farmtech.smartfarm.review.dto.ReviewDTO;
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
}
