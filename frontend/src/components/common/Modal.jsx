import React from 'react'
import ReactModal from 'react-modal'
import styles from './Modal.module.css'

//스크린리더 접근성 설정 - 통상적으로 넣어줌
ReactModal.setAppElement('#root') //#root -> react가 #root안에 모든 화면을 그려넣는 구조

const Modal = ({
  isOpen,                   // 모달 열림/닫힘 상태 (true/false)
  onClose,                  // 모달 닫기 함수 (부모에서 전달)
  title = '',               // 모달 상단 제목 (없으면 헤더 미표시)
  children,                 // 모달 안에 들어갈 내용 (부모 태그 사이 내용)
  width = '400px',          // 모달 너비 (기본 400px)
  showCloseButton = true,   // 우측 상단 X 버튼 표시 여부
  closeOnOverlay = true,    // 배경 클릭 시 닫기 여부
  className = '',           // 외부에서 추가 스타일 클래스 적용
}) => {

  // 모달 배경(어두운 오버레이) 스타일
  const overlayStyle = {
    backgroundColor : 'rgba(0, 0, 0, 0.5)'
  }

  // 모달 창 자체 스타일 (가운데 정렬)
  const contentStyle = {
    width,
    height: 'fit-content',
    margin: 'auto',
    padding: '0',
    border: 'none',
    borderRadius: '12px',
    inset: '50% auto auto 50%',       // top, right, bottom, left 위치
    transform: 'translate(-50%, -50%)', // 정확한 중앙 정렬
  }
  
  return (
    <ReactModal
      isOpen={isOpen}  //열림/닫힘 제어
      onRequestClose={onClose}  //ESC키 or 오버레이 클릭 시 실행
      shouldCloseOnOverlayClick={closeOnOverlay}  //오버레이 클릭으로 닫기여부
    >
      {/* className을 외부에서 추가할 수 있도록 병합 */}
      <div className={`${styles.modal} ${className}`}>

        {/* title이 있을 때만 헤더 영역 렌더링 */}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>

            {/* showCloseButton이 true일 때만 X 버튼 렌더링 */}

          </div>
        )}
      </div>

    </ReactModal>
  )
}

export default Modal
