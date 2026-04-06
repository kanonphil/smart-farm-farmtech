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