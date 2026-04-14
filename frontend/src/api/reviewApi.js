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

/**
 * 작성한 리뷰 목록 조회 api
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
export const getMyReviews = async (startDate, endDate) => {
  const response = await axiosInstance.get('/reviews/my', { params: { startDate, endDate } })
  return response
}

/**
 * 미작성 리뷰 목록 조회 api
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
export const getUnreviewedItems = async (startDate, endDate) => {
  const response = await axiosInstance.get('/reviews/unreviewed', { params: { startDate, endDate } })
  return response
}

/**
 * 리뷰 수정 api
 * @param {*} reviewId 
 * @param {*} data 
 * @returns 
 */
export const updateReview = async (reviewId, data) => {
  const formData = new FormData()
  formData.append('rating', data.rating)
  formData.append('content', data.content)
  if (data.imgFile) formData.append('imgFile', data.imgFile)
  const response = await axiosInstance.put(`/reviews/${reviewId}`, formData)
  return response
}

/**
 * 리뷰 삭제 api
 * @param {*} reviewId 
 * @returns 
 */
export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`)
  return response
}

// 고객 리뷰 최신순 각각 조회
export const getReviews = async(page,size) => {
  const response = await axiosInstance.get("reviews/customer",{
    params:{page,size}
  })
  return response;
}

// 고객 별점, 리뷰수 조회
export const getReviewRating = async() => {
  const response = await axiosInstance.get('reviews/ratingAndReviews')
  return response;
}

// 상품별 평균 별점, 별점 분포 조회
export const getProductRating = async(productId) => {
  const response = await axiosInstance.get('reviews/all', { params: { productId } })
  return response;
}