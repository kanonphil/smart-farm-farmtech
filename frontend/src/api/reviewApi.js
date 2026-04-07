import { axiosInstance } from "./axiosInstance"

/**
 * 리뷰 등록 API
 * POST /reviews
 * @param {Object} data - { orderItemId, productId, rating, content }
 * @returns {Promise}
 */
export const insertReview = async (data) => {
  const response = await axiosInstance.post('/reviews', data)
  return response
}

/**
 * 상품별 리뷰 목록 조회 API
 * GET /reviews/product/{productId}
 * @param {number} productId - 조회할 상품 ID
 * @returns {Promise}
 */
export const getReviewsByProduct = async (productId) => {
  const response = await axiosInstance.get(`/reviews/product/${productId}`)
  return response
}