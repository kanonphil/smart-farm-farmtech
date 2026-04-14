package com.farmtech.smartfarm.review.service;

import com.farmtech.smartfarm.ai.service.GeminiClient;
import com.farmtech.smartfarm.review.dto.ReviewDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Gemini API를 활용한 리뷰 악플 분석 서비스
 *
 * 리뷰 목록을 Gemini에 전달하여 각 리뷰의 유해성 등급을 반환한다.
 * 등급: CLEAN(정상) / SUSPICIOUS(의심) / TOXIC(악플)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiReviewService {

  private final GeminiClient geminiClient;
  private final ObjectMapper objectMapper;

  /**
   * 리뷰 목록에 AI 분석 등급(aiLabel)을 설정한다.
   *
   * Gemini에 리뷰 내용을 전달하고 각 reviewId에 대한
   * CLEAN / SUSPICIOUS / TOXIC 등급을 받아 DTO에 주입한다.
   * Gemini 호출 실패 시 전체 리뷰를 CLEAN으로 처리한다.
   *
   * @param reviews 분석할 리뷰 목록
   * @return aiLabel이 설정된 리뷰 목록
   */
  public List<ReviewDTO> analyzeReviews(List<ReviewDTO> reviews) {
    if (reviews == null || reviews.isEmpty()) return reviews;

    try {
      String prompt = buildPrompt(reviews);
      log.info("[GeminiReview] 리뷰 분석 요청 - {}건", reviews.size());
      String rawText = geminiClient.generateContent(prompt);
      applyLabels(reviews, rawText);
      log.info("[GeminiReview] 리뷰 분석 완료");
    } catch (Exception e) {
      log.warn("[GeminiReview] Gemini 호출 실패, 전체 CLEAN 처리: {}", e.getMessage());
      // 실패 시 전체 CLEAN으로 기본값 설정
      reviews.forEach(r -> r.setAiLabel("CLEAN"));
    }

    return reviews;
  }

  /**
   * 리뷰 분석용 Gemini 프롬프트를 생성한다.
   *
   * CLEAN / SUSPICIOUS / TOXIC 판단 기준을 구체적인 예시와 함께 명시하여
   * 정확도를 높인다.
   *
   * @param reviews 분석할 리뷰 목록
   * @return 완성된 프롬프트 문자열
   */
  private String buildPrompt(List<ReviewDTO> reviews) {
    StringBuilder sb = new StringBuilder();
    sb.append("너는 한국 쇼핑몰의 리뷰 관리 AI다.\n");
    sb.append("아래 리뷰 목록을 읽고 각 리뷰를 CLEAN, SUSPICIOUS, TOXIC 중 하나로 분류해라.\n\n");

    sb.append("[분류 기준]\n\n");

    sb.append("CLEAN: 실제 구매 경험을 바탕으로 작성된 리뷰\n");
    sb.append("  - 긍정적인 후기 (예: '맛있어요', '부드럽고 좋아요')\n");
    sb.append("  - 부정적이어도 구체적인 이유가 있는 후기 (예: '고기가 질겨요', '배송이 느렸어요', '가격 대비 별로')\n");
    sb.append("  - 단순하지만 진짜 경험으로 보이는 짧은 후기 (예: '맛있었어요', '재구매 의사 있음')\n\n");

    sb.append("SUSPICIOUS: 실제 사용 후기라고 보기 어려운 내용\n");
    sb.append("  - 동일 단어·문장 반복 도배 (예: '맛있어요맛있어요맛있어요...')\n");
    sb.append("  - 의미 없는 글자 나열 (예: 'gg', 'gggg', 'ㅎㅎㅎㅎ', '...', 'aaa')\n");
    sb.append("  - 상품과 전혀 무관한 내용 또는 광고성 문구\n");
    sb.append("  - 리뷰라고 볼 수 없을 만큼 내용이 없는 경우\n\n");

    sb.append("TOXIC: 명백히 유해하거나 악의적인 내용\n");
    sb.append("  - 욕설, 비속어 포함 (예: '에잇퉤', 비속어 등)\n");
    sb.append("  - 특정인 또는 판매자를 향한 혐오·비하 표현\n");
    sb.append("  - 상품을 빙자한 악성 민원성 공격\n\n");

    sb.append("[중요 원칙]\n");
    sb.append("- 부정적인 상품 평가는 CLEAN이다. 부정적 = 유해가 아니다.\n");
    sb.append("- 욕설이나 도배가 없으면 TOXIC이나 SUSPICIOUS로 분류하지 마라.\n");
    sb.append("- 짧아도 진짜 경험으로 보이면 CLEAN이다.\n\n");

    sb.append("[리뷰 목록]\n");
    for (ReviewDTO r : reviews) {
      sb.append("- reviewId: ").append(r.getReviewId())
              .append(", content: \"").append(r.getContent()).append("\"\n");
    }

    sb.append("\n[출력 형식] JSON 배열만 출력, 다른 텍스트 절대 금지\n");
    sb.append("[{\"reviewId\": 1, \"label\": \"CLEAN\"}, ...]");
    return sb.toString();
  }

  /**
   * Gemini 응답 JSON을 파싱하여 각 ReviewDTO에 aiLabel을 설정한다.
   *
   * @param reviews  aiLabel을 설정할 리뷰 목록
   * @param rawText  Gemini 응답 원문
   */
  private void applyLabels(List<ReviewDTO> reviews, String rawText) throws Exception {
    // reviewId → ReviewDTO 맵 생성
    Map<Integer, ReviewDTO> reviewMap = reviews.stream()
            .collect(Collectors.toMap(ReviewDTO::getReviewId, r -> r));

    // 마크다운 코드블록 제거 후 JSON 배열 추출
    String cleaned = rawText
            .replaceAll("```json", "")
            .replaceAll("```", "")
            .trim();

    // 정규식으로 JSON 배열 추출
    Pattern pattern = Pattern.compile("\\[[\\s\\S]*\\]");
    Matcher matcher = pattern.matcher(cleaned);
    if (!matcher.find()) throw new RuntimeException("JSON 배열 추출 실패");

    List<Map<String, Object>> result = objectMapper.readValue(
            matcher.group(), new TypeReference<>() {}
    );

    // 각 리뷰에 aiLabel 적용
    for (Map<String, Object> item : result) {
      int reviewId = (Integer) item.get("reviewId");
      String label = (String) item.get("label");
      ReviewDTO dto = reviewMap.get(reviewId);
      if (dto != null) dto.setAiLabel(label);
    }

    // Gemini가 누락한 리뷰는 CLEAN으로 기본값 설정
    reviews.stream()
            .filter(r -> r.getAiLabel() == null)
            .forEach(r -> r.setAiLabel("CLEAN"));
  }

  /**
   * 리뷰 내용과 별점을 분석하여 매니저 답글 초안을 생성한다.
   *
   * @param rating  리뷰 별점 (1~5)
   * @param content 리뷰 내용
   * @return 매니저 답글 초안 문자열
   */
  public String generateReplyDraft(int rating, String content) {
    String prompt = buildReplyPrompt(rating, content);
    return geminiClient.generateContent(prompt);
  }

  private String buildReplyPrompt(int rating, String content) {
    return """
            당신은 스마트팜 쇼핑몰의 친절한 고객 응대 담당자입니다.
            아래 고객 리뷰에 대한 매니저 답글 초안을 작성해주세요.

            [규칙]
            - 별점 4~5점: 감사 인사 위주, 따뜻하고 밝은 톤
            - 별점 3점: 이용해주셔서 감사하며 개선하겠다는 톤
            - 별점 1~2점: 불편을 드려 죄송하다는 사과 + 개선 의지, 공감하는 톤
            - 2~3문장, 간결하게
            - 특정 보상(환불, 쿠폰 등) 약속 금지
            - 답글 텍스트만 출력 (제목, 설명 없이)

            [리뷰]
            별점: %d점
            내용: %s
            """.formatted(rating, content);
  }

}
