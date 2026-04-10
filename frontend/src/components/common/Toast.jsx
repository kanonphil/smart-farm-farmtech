import { useEffect } from 'react'
import styles from './Toast.module.css'

const Toast = ({ show, message, onClose }) => {

  useEffect(() => {
    if (!show) return
    // 2.5초 후 자동으로 토스트 닫기
    const timer = setTimeout(onClose, 2500)
    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer)
  }, [show])

  if (!show) return null

  return (
    <div className={styles.toast}>
      <div className={styles.icon_wrap}>✅</div>
      <span className={styles.message}>{message}</span>
    </div>
  )
}

export default Toast