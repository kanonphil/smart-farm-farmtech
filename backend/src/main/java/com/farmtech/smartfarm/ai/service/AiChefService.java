package com.farmtech.smartfarm.ai.service;

import com.farmtech.smartfarm.ai.dto.*;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI 셰프 핵심 비즈니스 로직 서비스
 *
 * 주요 역할:
 * 1. Gemini 프롬프트 생성 및 호출
 * 2. Gemini 응답 JSON 파싱 (실패 시 fallback)
 * 3. 레시피 부위명 기반 DB 상품 매칭 및 점수 산정
 * 4. 최종 추천 결과 반환
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiChefService {

  private final GeminiClient geminiClient;
  private final ProductMapper productMapper;
  private final ObjectMapper objectMapper;

  /**
   * AI 셰프 추천 메인 메서드
   *
   * @param request 사용자 선택 조건 (상황, 스타일, 이전 추천 목록)
   * @return 레시피 + 매칭 상품 + fallback 정보를 담은 응답 DTO
   */
  public AiChefResponseDTO recommend(AiChefRequestDTO request) {
    AiChefResponseDTO response = new AiChefResponseDTO();

    // 1. DB에서 활성 상품 전체 조회
    List<ProductListDTO> allProducts = productMapper.selectActiveProducts();

    // 2. Gemini 호출 (상품 목록 포함)
    RecipeDTO recipe = null;
    try {
      String prompt = buildPrompt(request, allProducts);
      log.info("[AiChef] Gemini 호출 - 상황: {}, 스타일: {}", request.getSituation(), request.getStyle());
      String rawText = geminiClient.generateContent(prompt);
      recipe = parseRecipe(rawText);
      log.info("[AiChef] 레시피 파싱 성공: {}", recipe.getRecipeName());
    } catch (Exception e) {
      log.warn("[AiChef] Gemini 호출 실패, fallback 적용: {}", e.getMessage());
      recipe = createFallbackRecipe();
      response.setFallback(true);
      response.setFallbackMessage("지금은 AI 추천이 원활하지 않아 인기 한우 구이 조합으로 대신 추천드립니다.");
    }

    response.setRecipe(recipe);

    // 3. Gemini가 선택한 productId로 상품 조회
    List<MatchedProductDTO> matched = matchProductsByIds(recipe, allProducts);
    response.setMatchedProducts(matched);

    if (matched.isEmpty()) {
      response.setProductMatchMessage("추천 레시피는 찾았지만 현재 정확히 일치하는 상품이 없습니다.");
    }

    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // Gemini 프롬프트 빌더
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gemini에 전달할 프롬프트를 생성한다.
   *
   * "다른 추천 보기" 요청 시 previousRecipes를 제외 목록으로 포함한다.
   *
   * @param request 사용자 요청 DTO
   * @return 완성된 프롬프트 문자열
   */
  private String buildPrompt(AiChefRequestDTO request, List<ProductListDTO> products) {
    StringBuilder sb = new StringBuilder();

    sb.append("너는 한우 전문 쇼핑몰 '한우몰'의 AI 셰프다.\n\n");

    // 우리 쇼핑몰 상품 목록을 프롬프트에 포함
    sb.append("[우리 쇼핑몰 판매 상품 목록]\n");
    for (ProductListDTO p : products) {
      sb.append("- productId: ").append(p.getProductId())
              .append(", 상품명: ").append(p.getProductName()).append("\n");
    }

    // freeText 분기
    if (request.getFreeText() != null && !request.getFreeText().isBlank()) {
      sb.append("\n[검색 요청]\n");
      sb.append("사용자가 '").append(request.getFreeText()).append("' 관련 한우 레시피를 찾고 있다.\n");
      sb.append("이 키워드에 맞는 소고기 레시피를 추천해라.\n");
    } else {
      sb.append("\n[고객 조건]\n");
      sb.append("- 식사 상황: ").append(request.getSituation()).append("\n");
      sb.append("- 원하는 스타일/맛: ").append(request.getStyle()).append("\n");
    }

    // previousRecipes는 두 모드 공통 (if-else 밖)
    if (request.getPreviousRecipes() != null && !request.getPreviousRecipes().isEmpty()) {
      sb.append("- 이전 추천 레시피 (제외): ");
      sb.append(String.join(", ", request.getPreviousRecipes())).append("\n");
    }

    sb.append("\n[필수 규칙]\n");
    sb.append("1. 반드시 소고기(한우) 중심 요리만 추천\n");
    sb.append("2. 가정에서 실제 조리 가능한 현실적인 레시피 우선\n");
    sb.append("3. 설명은 전부 한국어\n");
    sb.append("4. matchingProductIds는 위 상품 목록에서 이 레시피에 가장 잘 맞는 상품의 productId를 1~3개 골라라\n");
    sb.append("5. 반드시 위 목록에 있는 productId만 사용할 것 (없으면 빈 배열)\n");
    sb.append("6. JSON 외 텍스트 절대 출력 금지\n\n");

    sb.append("[출력 형식]\n");
    sb.append("{\n");
    sb.append("  \"recipeName\": \"레시피명\",\n");
    sb.append("  \"summary\": \"한 줄 요약\",\n");
    sb.append("  \"recommendedReasonTitle\": \"선정 이유\",\n");
    sb.append("  \"recommendedReasonBody\": \"선정 이유 상세\",\n");
    sb.append("  \"recipeDescription\": {\n");
    sb.append("    \"difficulty\": \"하/중/상\",\n");
    sb.append("    \"cookingMethod\": \"조리 방법\",\n");
    sb.append("    \"mood\": \"어울리는 분위기\",\n");
    sb.append("    \"estimatedTimeMinutes\": 숫자\n");
    sb.append("  },\n");
    sb.append("  \"ingredients\": [{\"name\": \"재료명\", \"amount\": \"분량\"}],\n");
    sb.append("  \"steps\": [\"1단계\", \"2단계\"],\n");
    sb.append("  \"matchingCuts\": [{\"cutName\": \"부위명\", \"why\": \"추천 이유\"}],\n");
    sb.append("  \"matchingProductIds\": [1, 2, 3],\n");
    sb.append("  \"servingTips\": [\"팁1\"],\n");
    sb.append("  \"searchKeywords\": [\"검색어1\"]\n");
    sb.append("}");

    return sb.toString();
  }


  // ─────────────────────────────────────────────────────────────────
  // JSON 파싱 (fallback 포함)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gemini 응답 텍스트를 RecipeDTO로 파싱한다.
   *
   * 1차: 마크다운 코드블록 제거 후 직접 파싱
   * 2차 (1차 실패): 정규식으로 JSON 블록 추출 후 파싱
   * 3차 (2차 실패): 예외 throw → 호출부에서 fallback 처리
   *
   * @param rawText Gemini 응답 원문
   * @return 파싱된 RecipeDTO
   * @throws Exception JSON 파싱 최종 실패 시
   */
  private RecipeDTO parseRecipe(String rawText) throws Exception {
    // 1차 파싱 시도: 마크다운 코드블록 제거
    String cleaned = rawText
            .replaceAll("```json", "")
            .replaceAll("```", "")
            .trim();

    try {
      return objectMapper.readValue(cleaned, RecipeDTO.class);
    } catch (Exception e) {
      log.warn("[AiChef] 1차 파싱 실패, 정규식 추출 시도");
    }

    // 2차 파싱 시도: 정규식으로 JSON 블록 추출
    Pattern pattern = Pattern.compile("\\{[\\s\\S]*\\}");
    Matcher matcher = pattern.matcher(rawText);
    if (matcher.find()) {
      String extracted = matcher.group();
      try {
        return objectMapper.readValue(extracted, RecipeDTO.class);
      } catch (Exception e) {
        log.warn("[AiChef] 2차 파싱도 실패: {}", e.getMessage());
      }
    }

    throw new RuntimeException("JSON 파싱 최종 실패");
  }

  // ─────────────────────────────────────────────────────────────────
  // 상품 매칭 로직
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gemini가 선택한 productId로 상품을 찾아 반환한다.
   * allProducts에서 ID 기반으로 필터링하므로 DB 추가 조회 없음.
   *
   * @param recipe      Gemini 레시피 (matchingProductIds 포함)
   * @param allProducts DB 전체 활성 상품 목록
   * @return 매칭된 상품 목록 (최대 3개)
   */
  private List<MatchedProductDTO> matchProductsByIds(RecipeDTO recipe, List<ProductListDTO> allProducts) {
    if (recipe.getMatchingProductIds() == null || recipe.getMatchingProductIds().isEmpty()) {
      return List.of();
    }

    // productId → ProductListDTO 맵 생성
    Map<Integer, ProductListDTO> productMap = allProducts.stream()
            .collect(Collectors.toMap(ProductListDTO::getProductId, p -> p));

    List<MatchedProductDTO> result = new ArrayList<>();
    for (Integer productId : recipe.getMatchingProductIds()) {
      ProductListDTO p = productMap.get(productId);
      if (p != null && p.getProductStock() > 0 && "ACTIVE".equals(p.getProductStatus())) {
        MatchedProductDTO matched = new MatchedProductDTO(p);
        matched.setMatchReason("AI 셰프 추천 상품");
        result.add(matched);
      }
    }

    return result;
  }

  /**
   * 키워드로 상품을 검색하고 점수를 scoreMap에 누적한다.
   *
   * @param scoreMap 점수 누적 맵
   * @param keyword  검색 키워드
   * @param score    이 키워드로 매칭 시 부여할 점수
   * @param reason   매칭 이유 (첫 매칭 시 기록)
   */
  private void searchAndScore(
          Map<Integer, MatchedProductDTO> scoreMap,
          String keyword,
          int score,
          String reason
  ) {
    if (keyword == null || keyword.isBlank()) return;

    List<ProductListDTO> results = productMapper.selectProductList(null, keyword, null);
    for (ProductListDTO p : results) {
      if (scoreMap.containsKey(p.getProductId())) {
        // 이미 있는 상품이면 점수만 누적
        scoreMap.get(p.getProductId()).addScore(score);
      } else {
        // 신규 상품이면 MatchedProductDTO 생성
        MatchedProductDTO matched = new MatchedProductDTO(p);
        matched.addScore(score);
        matched.setMatchReason(reason);
        scoreMap.put(p.getProductId(), matched);
      }
    }
  }

  /**
   * 재료명이 소고기 관련인지 확인한다.
   * 일반 조미료/채소 재료는 DB 검색에서 제외하기 위해 사용된다.
   *
   * @param name 재료명
   * @return 소고기 관련 재료이면 true
   */
  private boolean isBeefRelated(String name) {
    String[] beefKeywords = {
            "살", "등심", "안심", "채끝", "부채", "불고기",
            "국거리", "한우", "소고기", "양지", "사태", "갈비",
            "차돌", "홍두깨", "우둔", "설도"
    };
    for (String kw : beefKeywords) {
      if (name.contains(kw)) return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────
  // Fallback 레시피
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gemini 호출 실패 시 반환할 기본 fallback 레시피를 생성한다.
   *
   * @return 한우 불고기 fallback RecipeDTO
   */
  private RecipeDTO createFallbackRecipe() {
    RecipeDTO fallback = new RecipeDTO();
    fallback.setRecipeName("한우 불고기");
    fallback.setSummary("실패 없는 국민 한우 요리, 온 가족이 즐기는 클래식");
    fallback.setRecommendedReasonTitle("선정 이유");
    fallback.setRecommendedReasonBody(
            "한우 불고기는 부드러운 식감과 달콤한 간장 양념이 어우러져 남녀노소 모두 즐길 수 있는 요리입니다. "
                    + "조리 난이도가 낮아 실패 확률이 거의 없으며, 불고기용으로 얇게 슬라이스된 상품을 그대로 활용할 수 있어 편리합니다."
    );

    RecipeDescriptionDTO desc = new RecipeDescriptionDTO();
    desc.setDifficulty("하");
    desc.setCookingMethod("팬 볶음");
    desc.setMood("가족 식사, 일상 한 끼");
    desc.setEstimatedTimeMinutes(20);
    fallback.setRecipeDescription(desc);

    IngredientDTO beef = new IngredientDTO();
    beef.setName("불고기용 한우");
    beef.setAmount("400g");

    IngredientDTO soy = new IngredientDTO();
    soy.setName("간장");
    soy.setAmount("3큰술");

    fallback.setIngredients(List.of(beef, soy));
    fallback.setSteps(List.of(
            "불고기 양념 (간장, 설탕, 참기름, 마늘)을 섞는다.",
            "한우 불고기를 양념에 30분 재운다.",
            "중불로 달군 팬에 볶는다.",
            "참깨를 뿌려 마무리한다."
    ));

    MatchingCutDTO cut = new MatchingCutDTO();
    cut.setCutName("불고기");
    cut.setWhy("얇게 슬라이스되어 빠른 조리와 부드러운 식감에 최적화된 부위");
    fallback.setMatchingCuts(List.of(cut));

    fallback.setServingTips(List.of("상추쌈과 함께 즐기면 좋습니다.", "냉면 위에 올려 비빔냉면으로 활용 가능합니다."));
    fallback.setSearchKeywords(List.of("불고기", "한우 불고기", "불고기용"));

    return fallback;
  }
}
