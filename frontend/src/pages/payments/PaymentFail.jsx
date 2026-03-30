import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './PaymentFail.module.css'

const PaymentFail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const errorCode = searchParams.get("code") || "ERROR"
  const errorMessage = searchParams.get("message") || "결제 실패 정보가 없습니다."
  
  return (
    <div className={`${styles.wrapper} ${styles.w100}`}>
      <div className={`${styles.flexColumn} ${styles.alignCenter} ${styles.w100} ${styles.maxW540}`}>
        
        <img
          src="https://static.toss.im/lotties/error-spot-apng.png"
          width="120"
          height="120"
          alt="결제 실패"
        />

        <h2 className={styles.title}>결제를 실패했어요</h2>

        <div className={`${styles.responseSection} ${styles.w100}`}>
          <div className={`${styles.flex} ${styles.justifyBetween}`}>
            <span className={styles.responseLabel}>code</span>
            <span className={styles.responseText}>{errorCode}</span>
          </div>

          <div className={`${styles.flex} ${styles.justifyBetween}`}>
            <span className={styles.responseLabel}>message</span>
            <span className={styles.responseText}>{errorMessage}</span>
          </div>
        </div>

        <div className={`${styles.w100} ${styles.buttonGroup}`}>
          
          <button
            className={`${styles.btn} ${styles.w100}`}
            onClick={() => navigate("/payment")}
          >
            다시 결제하기
          </button>

          <button
            className={`${styles.btn} ${styles.w100}`}
            onClick={() => navigate("/")}
          >
            홈으로 이동
          </button>

        </div>
      </div>
    </div>
  )
}

export default PaymentFail