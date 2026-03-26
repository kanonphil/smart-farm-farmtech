import styles from './SensorCard.module.css'

// label: 카드 제목 (예: 온도, 습도)
// value: 실제 값 (예: 24.5)
// unit: 단위 (예: ℃, %, lux)
const SensorCard = ({ label, value, unit }) => {
  const isMotion = label === '모션' && value === '감지'
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      {/* 값이 없을 때 - 표시 */}
      <p className={`${styles.value} ${isMotion ? styles.detected : ''}`}>{value !== null && value !== undefined ? `${value} ${unit}` : '-'}</p>
    </div>
  )
}

export default SensorCard