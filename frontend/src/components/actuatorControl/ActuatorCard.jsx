import Button from '../common/Button'
import styles from './ActuatorCard.module.css'

// label: 카드 제목 (예: LED, 부저)
// isOn: 현재 ON/OFF 상태
// onOn: ON 버튼 클릭 시 실행할 함수
// onOff: OFF 버튼 클릭 시 실행할 함수
// disabled: auto 모드일 때 버튼 비활성화
const ActuatorCard = ({ label, isOn, onOn, onOff, disabled }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{label}</h3>
        <span className={`${styles.badge} ${isOn ? styles.badgeOn : styles.badgeOff}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>
      <div className={styles.controls}>
        <Button onClick={onOn} disabled={disabled || isOn}>
          ON
        </Button>
        <Button onClick={onOff} disabled={disabled || !isOn} variant="danger">
          OFF
        </Button>
      </div>
    </div>
  )
}

export default ActuatorCard