package com.farmtech.smartfarm.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Gemini API 호출 전달 클라이언트
 *
 * Gemini 2.5 Flash 모델에 텍스트 프롬프트를 전송하고
 * 응답 텍스트를 반환한다.
 * AiChefService 및 AiService에서 공통으로 사용가능하다.
 */
@Slf4j
@Component
public class GeminiClient {
  // appication-secret.properties의 gemini.api.key 주입
  @Value("${gemini.api.key.chef}")
  private String chefApiKey;

  @Value("${gemini.api.key.review}")
  private String reviewApiKey;

  // Gemini API 베이스 URL
  private static final String GEMINI_URL_CHEF =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
  private static final String GEMINI_URL_REVIEW =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

  // HTTP 클라이언트
  private final WebClient webClient = WebClient.create();

  /**
   * AI Chef용 Gemini API 호출
   */
  public String generateContent(String prompt) {
    return callGemini(prompt, chefApiKey, GEMINI_URL_CHEF);
  }

  /**
   * 리뷰 분석용 Gemini API 호출 (별도 API 키 사용)
   */
  public String generateContentForReview(String prompt) {
    return callGemini(prompt, reviewApiKey, GEMINI_URL_REVIEW);
  }

  /**
   * 공통 Gemini API 호출 내부 메서드
   *
   * @param prompt  전달할 프롬프트
   * @param apiKey  사용할 API 키
   * @return Gemini 응답 텍스트
   */
  private String callGemini(String prompt, String apiKey, String baseUrl) {
    Map<String, Object> body = Map.of(
            "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            )
    );

    String url = baseUrl + "?key=" + apiKey;

    Map<?, ?> response = webClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> Mono.error(
                            new RuntimeException("Gemini API 오류: " + clientResponse.statusCode())
                    )
            )
            .bodyToMono(Map.class)
            .block();

    List<?> candidates = (List<?>) response.get("candidates");
    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
    List<?> parts = (List<?>) content.get("parts");
    Map<?, ?> part = (Map<?, ?>) parts.get(0);

    return (String) part.get("text");
  }
}
