import { axiosInstance } from "./axiosInstance"

/**
 * 주문 생성
 * @param {{ orderDTO: object, orderItemDTOList: Array }} data
 * @returns {Promise<{tossOrderId: string}>}
 */
export const insertOrder = async (data) => {
  const response = await axiosInstance.post('/orders', data)
  return response
}

/**
 * 주문 취소 (결제 실패/취소 시)
 * @param {string} tossOrderId
 * @returns {Promise}
 */
export const cancelOrder = async (tossOrderId) => {
  const response = await axiosInstance.patch('/orders/cancel', null, {
    params: { tossOrderId }
  })
  return response
}

/**
 * 구매 확정
 * @param {number} orderId - 구매 확정할 주문 ID
 * @returns {Promise}
 */
export const confirmOrder = async (orderId) => {
  const response = await axiosInstance.patch(`/orders/${orderId}/confrim`)
  return response
}

/**
 * 관리자 전체 주문 목록 조회
 * @returns {Promise}
 */
export const getManagerOrderList = async () => {
  const response = await axiosInstance.get('/manager/orders')
  return response
}

/**
 * 배송 시작 처리
 * @param {number} orderId - 배송 시작할 주문 ID
 * @returns {Promise}
 */
export const startShipping = async (orderId) => {
  const response = await axiosInstance.patch(`/manager/orders/${orderId}/shipping-start`)
  return response
}