package com.farmtech.smartfarm.ai.service;

import com.farmtech.smartfarm.ai.dto.AiRequestDTO;
import com.farmtech.smartfarm.ai.dto.AiResponseDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

  // application.properties의 gemini.api.key 값을 자동 주입
  @Value("${gemini.api.key}")
  private String apiKey;

  // HTTP 요청을 보내는 클라이언트 (Gemini API 호출용)
  private final WebClient webClient = WebClient.create();

  // 재료명으로 상품 검색하기 위해 주입
  private final ProductMapper productMapper;

  public AiResponseDTO getRecipe(AiRequestDTO request) throws Exception{
    // 1. Gemini에게 보낼 질문 구성
    // request.getServings() = 인원수, request.getMenu() = 메뉴명
    // AI가 반드시 JSON 형식으로만 응답하도록 강제
    String prompt = String.format(
      "%d인분 %s 레시피를 알려주세요. " +
      "응답은 반드시 아래 JSON 형식으로만 주세요:\n" +
      "{\"recipe\": \"레시피 설명\", \"ingredients\": [\"재료1\", \"재료2\"]}",
      request.getServings(), request.getMenu()
    );

    // 2. Gemini API 엔드포인트 URL (키를 쿼리스트링으로 전달)
    String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    // Gemini API가 요구하는 요청 body 구조
    // { contents: [{ parts: [{ text: "질문" }] }] }
    Map<String, Object> body = Map.of(
    "contents", List.of(Map.of(
    "parts", List.of(Map.of("text", prompt))
      ))
    );

    // WebClient로 POST 요청 전송
    // .block() = 응답이 올 때까지 기다림 (동기 방식)
    Map response = webClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .onStatus(status -> status.value() == 429, clientResponse -> {
              // 429 에러 발생 시 로그를 남기거나 예외를 던짐
              return Mono.error(new RuntimeException("API 요청 한도 초과 (429)"));
            })
            .bodyToMono(Map.class)
            .block();

    // 3. Gemini 응답 구조에서 실제 텍스트만 꺼내기
    List candidates = (List) response.get("candidates");
    Map candidate = (Map) candidates.get(0);
    Map content = (Map) candidate.get("content");
    List parts = (List) content.get("parts");
    Map part = (Map) parts.get(0);
    String text = (String) part.get("text");

    // 4. AI 응답 텍스트를 Java 객체로 변환
    ObjectMapper mapper = new ObjectMapper();

    // Gemini가 가끔 ```json ... ``` 마크다운 형식으로 감싸서 줄 때가 있음
    // 파싱 전에 제거
    text = text.replaceAll("```json", "").replaceAll("```", "").trim();

    // JSON 문자열 → Map으로 파싱
    Map<String, Object> parsed = mapper.readValue(text, Map.class);

    // 파싱된 Map에서 레시피 설명과 재료 목록 추출
    String recipe = (String) parsed.get("recipe");
    List<String> ingredients = (List<String>) parsed.get("ingredients");

    // 5. 재료 목록으로 우리 DB 상품 검색
    // ex) ["돼지고기", "김치", "두부"] → 각각 LIKE 검색
    List<ProductListDTO> products = new ArrayList<>();
    for (String ingredient : ingredients) {
      // 재료명이 포함된 상품 검색 (keyword LIKE '%재료명%')
      List<ProductListDTO> found = productMapper.selectProductList(null, ingredient);
      products.addAll(found);
    }

    // 6. 레시피 + 추천 상품 묶어서 반환
    AiResponseDTO result = new AiResponseDTO();
    result.setRecipe(recipe);
    result.setProducts(products);
    return result;

  }
}
