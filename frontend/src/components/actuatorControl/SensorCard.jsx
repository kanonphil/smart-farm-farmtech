import styles from './SensorCard.module.css'

/**
 * @param {string} label - 카드 제목 (예: 온도, 습도)
 * @param {number|string} value - 측정값
 * @param {string} unit - 단위
 * @param {string} [statusLabel] - 상태 텍스트 (예: 적정, 낮음, 높음)
 * @param {string} [statusLevel] - 색상 기준 (good | low | high | bad)
 */
const SensorCard = ({ label, value, unit, statusLabel, statusLevel }) => {
  const isMotion = label === '모션' && value === '감지'
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      {/* 값이 없을 때 - 표시 */}
      <p className={`${styles.value} ${isMotion ? styles.detected : ''}`}>
        {value !== null && value !== undefined ? `${value} ${unit}` : '-'}
      </p>
      {statusLabel && (
        <p className={`${styles.status} ${styles[statusLevel]}`}>{statusLabel}</p>
      )}
    </div>
  )
}

export default SensorCard