import { useEffect } from 'react'
import styles from './Modal.module.css'

const Modal = ({ open, onClose, children }) => {
  //모달을 쓰는 페이지가 있을 때 스크롤 숨김
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])
  //open이 false면 모달 숨김 아무것도 렌더링 안함
  if (!open) return null

  //e.stopPropagation() 이벤트 객체 즉 모든 함수를 바깥(부모)으로 나가는걸 막는 함수
  //바깥을 클릭하면 닫힘
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default Modal
