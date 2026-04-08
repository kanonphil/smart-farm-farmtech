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

export const getMonthSales = async (year) => {
  const response = await axiosInstance.get(`/dashboards/sales-month/${year}`)
  return response.data
}