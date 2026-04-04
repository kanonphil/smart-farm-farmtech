import React from 'react'
import styles from './Step.module.css'

const Step = ({ currentStep }) => {
  
  const steps = ['상품선택', '장바구니', '주문/결제', '주문완료']

  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <div key={index} className={styles.stepItem}>
          <div className={`${styles.stepCircle} ${currentStep === index ? styles.active : currentStep > index ? styles.done : ''}`}>
            {index + 1}
          </div>
          <span className={`${styles.stepLabel} ${currentStep === index ? styles.activeLabel : ''}`}>
            {step}
          </span>
          {index < steps.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  )
}

export default Step
