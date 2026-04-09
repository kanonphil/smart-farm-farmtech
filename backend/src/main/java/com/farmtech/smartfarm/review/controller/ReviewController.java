package com.farmtech.smartfarm.review.controller;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;

  /**
   * 리뷰 등록 API
   *
   * JWT에서 추출한 memberId를 reviewDTO에 주입하여
   * 본인 인증 없이 타인 명의로 등록하는 것을 방지
   *
   * @param reviewDTO 등록한 리뷰 정보 (productId, orderItemId, rating, content)
   * @param userDetail JWT 인증 정보
   * @return 200 OK
   */
  @PostMapping(consumes = "multipart/form-data")
  public ResponseEntity<?> insertReview(
          @ModelAttribute ReviewDTO reviewDTO,
          @AuthenticationPrincipal CustomUserDetails userDetail,
          @RequestParam(value = "imgFile", required = false)MultipartFile imgFile
          ) throws IOException {
    // JWT에서 memberId 주입 (프론트에서 받지 않음)
    reviewDTO.setMemberId(userDetail.getMemberDTO().getMemberId());
    reviewService.insertReview(reviewDTO,imgFile);
    return ResponseEntity.ok().build();
  }

  /**
   * 상품별 리뷰 목록 조회 API
   *
   * @param productId 조회할 상품 ID
   * @return 리뷰 목록
   */
  @GetMapping("/product/{productId}")
  public ResponseEntity<List<ReviewDTO>> getReviews(@PathVariable int productId) {
    return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
  }

  //작성한 리뷰 조회 api
  @GetMapping("/my")
  public ResponseEntity<?> getMyReviews(
          @RequestParam String startDate,
          @RequestParam String endDate,
          @AuthenticationPrincipal CustomUserDetails userDetail) {
    int memberId = userDetail.getMemberDTO().getMemberId();
    return ResponseEntity.ok(reviewService.getMyReviews(memberId, startDate, endDate));
  }

  //아직 작성하지 않은 리뷰 조회 api
  @GetMapping("/unreviewed")
  public ResponseEntity<?> getUnreviewedItems(
          @RequestParam String startDate,
          @RequestParam String endDate,
          @AuthenticationPrincipal CustomUserDetails userDetail) {
    int memberId = userDetail.getMemberDTO().getMemberId();
    return ResponseEntity.ok(reviewService.getUnreviewedOrderItems(memberId, startDate, endDate));
  }

  //리뷰 수정 api
  @PutMapping(value = "/{reviewId}", consumes = "multipart/form-data")
  public ResponseEntity<?> updateReview(
          @PathVariable int reviewId,
          @ModelAttribute ReviewDTO reviewDTO,
          @RequestParam(value = "imgFile", required = false) MultipartFile imgFile,
          @AuthenticationPrincipal CustomUserDetails userDetail)throws IOException {
    reviewDTO.setReviewId(reviewId);
    reviewDTO.setMemberId(userDetail.getMemberDTO().getMemberId());
    reviewService.updateReview(reviewDTO,imgFile);
    return ResponseEntity.ok().build();
  }

  //리뷰 삭제 api
  @DeleteMapping("/{reviewId}")
  public ResponseEntity<?> deleteReview(
          @PathVariable int reviewId,
          @AuthenticationPrincipal CustomUserDetails userDetail) {
    int memberId = userDetail.getMemberDTO().getMemberId();
    reviewService.deleteReview(reviewId, memberId);
    return ResponseEntity.ok().build();
  }

  //고객 리뷰 조회
  @GetMapping("/customer")
  public ResponseEntity<?> selectReviewCustomer(){
    List<ReviewDTO> list = reviewService.selectReviewCustomer();
    return ResponseEntity.ok().body(list);
  }

  //고객 총 리뷰수, 평균평점, 7일, 30일(리뷰,평점)
  @GetMapping("/ratingAndReviews")
  public ResponseEntity<?> ratingAndReviews(){
    Map<String,Object> list = reviewService.ratingAndReviews();
    return ResponseEntity.ok().body(list);
  }
}
