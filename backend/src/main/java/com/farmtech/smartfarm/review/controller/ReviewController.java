package com.farmtech.smartfarm.review.controller;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.farmtech.smartfarm.review.service.GeminiReviewService;
import com.farmtech.smartfarm.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;
  private final GeminiReviewService geminiReviewService;

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
  public ResponseEntity<?> selectReviewCustomer(@RequestParam("page")int page,
                                                @RequestParam("size")int size){
    List<ReviewDTO> list = reviewService.selectReviewCustomer(page,size);
    return ResponseEntity.ok().body(list);
  }

  //고객 총 리뷰수, 평균평점, 7일, 30일(리뷰,평점)
  @GetMapping("/ratingAndReviews")
  public ResponseEntity<?> ratingAndReviews(){
    Map<String,Object> list = reviewService.ratingAndReviews();
    return ResponseEntity.ok().body(list);
  }

  //해당상품 리뷰 평점들, 카운트
  @GetMapping("/all")
  public ResponseEntity<?> rrrrrrrrrr(@RequestParam("productId")int productId){
    Map<String,Object> list = reviewService.countAndRating(productId);
    return ResponseEntity.ok().body(list);
  }

  // ─── 매니저 전용 API ───────────────────────────────────────────

  /**
   * 전체 리뷰 목록 조회 API (매니저 전용)
   *
   * @return 상품명·회원명 포함 전체 리뷰 목록
   */
  @GetMapping("/manager")
  public ResponseEntity<List<ReviewDTO>> getAllReviewsForManager() {
    return ResponseEntity.ok(reviewService.getAllReviewsForManager());
  }

  /**
   * 매니저 권한 리뷰 삭제 API
   *
   * @param reviewId 삭제할 리뷰 ID
   */
  @DeleteMapping("/manager/{reviewId}")
  public ResponseEntity<?> deleteReviewByManager(@PathVariable int reviewId) {
    reviewService.deleteReviewByManager(reviewId);
    return ResponseEntity.ok().build();
  }

  /**
   * 리뷰 블라인드/복구 API (매니저 전용)
   *
   * @param reviewId 대상 리뷰 ID
   * @param body     {"status": "BLINDED"} 또는 {"status": "VISIBLE"}
   */
  @PatchMapping("/manager/{reviewId}/status")
  public ResponseEntity<?> updateReviewStatus(
          @PathVariable int reviewId,
          @RequestBody Map<String, String> body) {
    reviewService.updateReviewStatus(reviewId, body.get("status"));
    return ResponseEntity.ok().build();
  }

  /**
   * 리뷰 AI 분석 요청 API (매니저 전용)
   *
   * aiLabel이 NULL인 미분석 리뷰만 Gemini에 전달하여 등급을 분석하고 DB에 저장한다.
   * 이미 분석된 리뷰는 건너뛰어 불필요한 API 호출을 방지한다.
   * TOXIC 판정 리뷰는 자동으로 블라인드 처리된다.
   *
   * @return aiLabel 및 status가 반영된 전체 리뷰 목록
   */
  @PostMapping("/manager/analyze")
  public ResponseEntity<List<ReviewDTO>> analyzeReviews() {
    // 1. 전체 리뷰 조회 (DB에 저장된 aiLabel 포함)
    List<ReviewDTO> allReviews = reviewService.getAllReviewsForManager();

    // 2. aiLabel이 없는 미분석 리뷰만 필터링
    List<ReviewDTO> unanalyzed = allReviews.stream()
            .filter(r -> r.getAiLabel() == null)
            .collect(Collectors.toList());

    if (!unanalyzed.isEmpty()) {
      // 3. 미분석 리뷰만 Gemini 분석
      geminiReviewService.analyzeReviews(unanalyzed);

      // 4. 분석 결과 DB 저장 + TOXIC 자동 블라인드
      unanalyzed.forEach(r -> {
        reviewService.updateAiLabel(r.getReviewId(), r.getAiLabel());
        if ("TOXIC".equals(r.getAiLabel())) {
          reviewService.updateReviewStatus(r.getReviewId(), "BLINDED");
          r.setStatus("BLINDED");
        }
      });
    }

    return ResponseEntity.ok(allReviews);
  }


}
