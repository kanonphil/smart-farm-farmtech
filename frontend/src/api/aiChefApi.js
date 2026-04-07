import axios from "axios"

/**
 * AI 셰프 추천 API 호출
 * 
 * 비로그인 사용자도 사용 가능하므로 axiosInstance가 아닌 axios 사용
 * 
 * @param {Object} payload - {situation, style, previousRecipes}
 * @returns {Promise<Object>} - {recipe, matchedProducts, fallback, fallbackMessage}
 */
export const requestAiChefRecommendation = async (payload) => {
  const response = await axios.post('http://localhost:8080/api/ai-chef/recommend', payload)
  return response.data
}