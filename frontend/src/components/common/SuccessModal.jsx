import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import styles from './SuccessModal.module.css'

const SuccessModal = ({ show, message, onClose }) => {
  useEffect(() => {
    if (!show) return

    const end = Date.now() + 2000
    
    // 불꽃놀이
    const fire = () => {
      confetti({
        particleCount: 30, // 입자 수
        angle: 60, //왼쪽에서 발사되는 각도
        spread: 70,  //퍼지는 범위
        origin: { x: 0 },  //왼쪽 끝에서 발사
        colors: ['#4caf50', '#81c784', '#ffeb3b', '#ff9800', '#f44336']
      })
      confetti({
        particleCount: 30,
        angle: 120, //오른쪽에서 발사되는 각도
        spread: 70,
        origin: { x: 1 },
        colors: ['#4caf50', '#81c784', '#ffeb3b', '#ff9800', '#f44336']
      })
      if (Date.now() < end) requestAnimationFrame(fire)  // 2초 동안 계속 반복
    }

    fire()

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show])

  if (!show) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>🎉</div>
        <p className={styles.title}>회원가입 완료!</p>
        <p className={styles.message}>{message}</p>
        <button className={styles.btn} onClick={onClose}>시작하기</button>
      </div>
    </div>
  )
}

export default SuccessModal