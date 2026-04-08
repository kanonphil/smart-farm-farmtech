import React from 'react'
import styles from './StockStatusBadge.module.css'

/**
 * 재고 수량에 따라 위험/주의/안정 상태를 배지로 표시하는 컴포넌트
 *
 * - 0 ~ 10  : 위험 (빨간색)
 * - 11 ~ 30 : 주의 (주황색)
 * - 31 이상  : 안정 (초록색)
 *
 * @param {number} stock - 재고 수량
 */
const StockStatusBadge = ({ stock }) => {
  const getStatus = (stock) => {
    if (stock <= 9) return { label: '위험', className: styles.danger }
    if (stock <= 49) return { label: '주의', className: styles.warning }
    return { label: '안정', className: styles.safe }
  }

  const status = getStatus(stock)

  return (
    <span className={`${styles.badge} ${status.className}`}>
      {status.label}
    </span>
  )
}

export default StockStatusBadge
