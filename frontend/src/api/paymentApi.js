import { axiosInstance } from "./axiosInstance"

// 결제 승인
export const confirmPaymentApi = ({ paymentKey, orderId, amount }) => {
  return axiosInstance.post("/api/payments/confirm", {
    paymentKey,
    orderId,
    amount,
  });
};

/**
 * 결제 취소 (환불)
 * @param {number} orderId
 * @param {string} cancelReason
 * @returns {Promise}
 */
export const cancelPaymentApi = async (orderId, cancelReason = '고객 변심') => {
  const response = await axiosInstance.post('/api/payments/cancel', {
    orderId, cancelReason
  })
  return response
}