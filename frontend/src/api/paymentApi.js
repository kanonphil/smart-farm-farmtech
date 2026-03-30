import { axiosInstance } from "./axiosInstance"

// 결제 승인
export const confirmPaymentApi = ({ paymentKey, orderId, amount }) => {
  return axiosInstance.post("/api/payments/confirm", {
    paymentKey,
    orderId,
    amount,
  });
};