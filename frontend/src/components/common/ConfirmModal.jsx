import styles from './ConfirmModal.module.css'

const ConfirmModal = ({ show, message, onConfirm, onClose }) => {
  if (!show) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>❓</div>
        <p className={styles.message}>{message}</p>
        <div className={styles.btn_wrap}>
          <button className={styles.btn_cancel} onClick={onClose}>취소</button>
          <button className={styles.btn_confirm} onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal