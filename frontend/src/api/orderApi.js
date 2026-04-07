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