import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Payments.module.css";

// 임시 주문번호 생성 (실제로는 서버에서 주문 생성 후 받아와야 함)
const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.floor(Math.random() * 100000)}`
};

// API 개별 연동 클라이언트 키 (test_ck_로 시작)
const clientKey = 'test_ck_DpexMgkW36yZdZdWlB698GbR5ozO'

const Payments = () => {
  const handlePayment = async () => {
    try {
      // 1. SDK 초기화
      const tossPayments = await loadTossPayments(clientKey)

      // 2. payment 객체 생성 (위젯 방식의 widgets() 대신 payment() 사용)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS })

      // 3. 결제창 호출
      await payment.requestPayment({
        method: 'CARD',           // 카드 결제
        amount: {
          currency: 'KRW',
          value: 1000,               // 테스트용 1원
        },
        orderId: 'ORDER_TEST_014', // generateOrderId()로 변경하기
        orderName: '테스트 상품',
        customerName: 'TEST1',
        customerEmail: 'test1@test.com',
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
      })
    } catch (error) {
      console.error('결제 요청 오류:', error)
      alert(error?.message || '결제 요청 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={`${styles.wrapper} ${styles.w100}`}>
      <div className={`${styles.maxW540} ${styles.w100}`}>
        <div className={`${styles.btnWrapper} ${styles.w100}`}>
          <button
            className={`${styles.btn} ${styles.primary} ${styles.w100}`}
            onClick={handlePayment}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payments;