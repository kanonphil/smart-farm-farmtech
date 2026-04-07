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
 * Gemini 2.0 Flash 모델에 텍스트 프롬프트를 전송하고
 * 응답 텍스트를 반환한다.
 * AiChefService 및 AiService에서 공통으로 사용가능하다.
 */
@Slf4j
@Component
public class GeminiClient {
  // appication-secret.properties의 gemini.api.key 주입
  @Value("${gemini.api.key}")
  private String apiKey;

  // Gemini API 베이스 URL
  private static final String GEMINI_URL =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

  // HTTP 클라이언트
  private final WebClient webClient = WebClient.create();

  /**
   * Gemini API에 프롬프트를 전송하고 응답 텍스트를 반환한다.
   *
   * @param prompt Gemini에 전달한 프롬프트 전문
   * @return Gemini가 생성한 텍스트 응답
   * @throws RuntimeException API 호출 실패 또는 응답 파싱 실패 시
   */
  public String generateContent(String prompt) {
    // 요청 body 구성 (Gemini API 스펙)
    Map<String, Object> body = Map.of(
            "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            )
    );

    String url = GEMINI_URL + "?key=" + apiKey;

    // WebClient로 POST 요청 전송
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

    // 응답 구조에서 텍스트 추출
    // Gemini 응답: candidates[0].content.parts[0].text
    List<?> candidates = (List<?>) response.get("candidates");
    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
    List<?> parts = (List<?>) content.get("parts");
    Map<?, ?> part = (Map<?, ?>) parts.get(0);

    return (String) part.get("text");
  }
}
