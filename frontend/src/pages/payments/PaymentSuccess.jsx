import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPaymentApi } from '../../api/paymentApi'
import styles from './PaymentSuccess.module.css'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)
  
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [searchParams] = useSearchParams()

  const paymentKey = searchParams.get("paymentKey")
  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")

  const confirmPayment = async () => {
    // TODO: API를 호출해서 서버에게 paymentKey, orderId, amount를 넘겨주세요.
    // 서버에선 해당 데이터를 가지고 승인 API를 호출하면 결제가 완료됩니다.
    // https://docs.tosspayments.com/reference#%EA%B2%B0%EC%A0%9C-%EC%8A%B9%EC%9D%B8
    try {
      setIsLoading(true)

      const response = await confirmPaymentApi({
        paymentKey,
        orderId,
        amount,
      })

      if (response.status === 200) {
        setIsConfirmed(true)
      }
    } catch (error) {
      console.error("결제 승인 실패", error)
      alert("결제 승인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 결제 완료 후 3초 뒤 메인으로 자동 이동
  useEffect(() => {
    if (!isConfirmed) return

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    const timer = setTimeout(() => {
      navigate('/')
    }, 3000)

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [isConfirmed])
  
  return (
    <div className={`${styles.wrapper} ${styles.w100}`}>
      {isConfirmed ? (
        <div
          className={`${styles.flexColumn} ${styles.alignCenter} ${styles.confirmSuccess} ${styles.w100} ${styles.maxW540}`}
        >
          <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
            alt="결제 완료"
          />

          <h2 className={styles.title}>결제를 완료했어요</h2>

          <div className={`${styles.responseSection} ${styles.w100}`}>
            <div className={`${styles.flex} ${styles.justifyBetween}`}>
              <span className={styles.responseLabel}>결제 금액</span>
              <span className={styles.responseText}>{amount.toLocaleString()}원</span>
            </div>

            <div className={`${styles.flex} ${styles.justifyBetween}`}>
              <span className={styles.responseLabel}>주문번호</span>
              <span className={styles.responseText}>{orderId}</span>
            </div>

            <div className={`${styles.flex} ${styles.justifyBetween}`}>
              <span className={styles.responseLabel}>paymentKey</span>
              <span className={styles.responseText}>{paymentKey}</span>
            </div>

            <button
              className={`${styles.btn} ${styles.primary} ${styles.w100}`}
              onClick={() => navigate('/')}
            >
              메인으로 돌아가기
            </button>
            <p className={styles.p}>{countdown}초 뒤 메인 화면으로 이동합니다.</p>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.flexColumn} ${styles.alignCenter} ${styles.confirmLoading} ${styles.w100} ${styles.maxW540}`}
        >
          <div className={`${styles.flexColumn} ${styles.alignCenter}`}>
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="120"
              height="120"
              alt="로딩"
            />
            <h2 className={`${styles.title} ${styles.textCenter}`}>
              결제 요청까지 성공했어요.
            </h2>
            <h4 className={`${styles.textCenter} ${styles.description}`}>
              결제 승인하고 완료해보세요.
            </h4>
          </div>

          <div className={styles.w100}>
            <button
              className={`${styles.btn} ${styles.primary} ${styles.w100}`}
              onClick={confirmPayment}
              disabled={isLoading}
            >
              {isLoading ? "승인 중..." : "결제 승인하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentSuccess