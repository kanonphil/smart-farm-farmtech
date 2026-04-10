import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect } from "react";
import styles from "./Payments.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// 임시 주문번호 생성 (실제로는 서버에서 주문 생성 후 받아와야 함)
const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.floor(Math.random() * 100000)}`
};

// API 개별 연동 클라이언트 키 (test_ck_로 시작)
const clientKey = 'test_ck_DpexMgkW36yZdZdWlB698GbR5ozO'

const Payments = () => {
  const { showAlert } = useAuthStore() 
  const { state } = useLocation()
  const nav = useNavigate()

  useEffect(() => {
    if (!state) {
      nav('/')
      return
    }
    handlePayment()
  }, [])

  const handlePayment = async () => {
    try {
      // tossOrderId 생성 (Toss에 넘기는 우리 쇼핑몰 주문번호, 고유값이어야 함)
      const tossOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 100000)}`

      // Toss SDK 초기화 (clientKey로 인증)
      const tossPayments = await loadTossPayments(clientKey)

      // payment 객체 생성
      // ANONYMOUS: 비회원 결제 방식 (회원 연동 시 customerKey에 회원 고유값 넣으면 됨)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS })

      if (state.method === '카드') {
        await payment.requestPayment({
          method: 'CARD',           // 결제 수단
          amount: {
            currency: 'KRW',        // 화폐 단위
            value: state.amount,    // Order.jsx에서 navigate로 넘긴 주문 총금액
          },
          orderId: tossOrderId,           // 위에서 생성한 우리 쇼핑몰 주문번호
          orderName: state.orderName,     // 결제창에 표시될 상품명
          customerName: state.customerName, // 결제자 이름
          customerEmail: state.customerEmail, // 결제자 이메일 (영수증 발송)
          // 결제 완료 시 Toss가 이 URL로 리다이렉트
          // ?paymentKey=xxx&orderId=xxx&amount=xxx 쿼리스트링 붙여서 넘겨줌
          successUrl: window.location.origin + '/payment/success',
          // 결제 실패/취소 시 이 URL로 리다이렉트
          failUrl: window.location.origin + '/payment/fail',
        })
      }
      // 나중에 결제수단 추가 시 여기에 else if로 추가
      // ex) else if (state.method === '무통장입금') { ... }

    } catch (error) {
      console.error('결제 요청 오류:', error)
      showAlert(error?.message || '결제 요청 중 오류가 발생했습니다.')
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