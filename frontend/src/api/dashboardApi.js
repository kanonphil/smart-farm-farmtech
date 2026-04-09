import { axiosInstance } from "./axiosInstance"

/**
 * 금일, 전일 회원 수 조회
 * @returns 
 */
export const getMemberCount = async () => {
  const response = await axiosInstance.get('/dashboards/member-count')
  return response.data
}

/**
 * 전체, 지난달 회원 수 조회
 * @returns 
 */
export const getTotalMember = async () => {
  const response = await axiosInstance.get('/dashboards/member-total')
  return response.data
}

/**
 * 금일, 전일 매출 조회
 * @returns 
 */
export const getTodayPrice = async () => {
  const response = await axiosInstance.get('/dashboards/price-today')
  return response.data
}

/**
 * 금일 주문건수 조회
 * @returns 
 */
export const getTodayOrder = async () => {
  const response = await axiosInstance.get('/dashboards/order-today')
  return response.data
}

/**
 * 해당연도 월별 매출 조회
 * @param {*} year 
 * @returns 
 */
export const getMonthSales = async (year) => {
  const response = await axiosInstance.get(`/dashboards/sales-month/${year}`)
  return response.data
}

/**
 * 주문 상태 조회
 * @returns 
 */
export const getOrderStatus = async () => {
  const response = await axiosInstance.get('/dashboards/order-status')
  return response.data
}

/**
 * 멤버 별 구매순위 탑10 
 * @returns 
 */
export const getMemberRank = async () => {
  const response = await axiosInstance.get('/dashboards/member-rank')
  return response.data
}

/**
 * 상품 별 판매순위 탑 5
 * @returns 
 */
export const getProductRank = async () => {
  const response = await axiosInstance.get('/dashboards/product-rank')
  return response.data
}