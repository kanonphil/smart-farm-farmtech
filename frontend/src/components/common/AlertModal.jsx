import { useEffect } from 'react'
import styles from './AlertModal.module.css'

const AlertModal = ({ show, message, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()  // ← 버튼 클릭 이벤트 방지
        onClose()
      }
    }
    if (show) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show])

  if (!show) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>⚠️</div>
        <p className={styles.message}>{message}</p>
        <button className={styles.btn} onClick={onClose}>확인</button>
      </div>
    </div>
  )
}

export default AlertModal
