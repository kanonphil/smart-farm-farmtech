import React, { useState, useEffect } from 'react'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import styles from './UpdateStockModal.module.css'
import { updateManagerProductStock } from '../../../api/managerApi'

/**
 * 재고 수정 모달 컴포넌트
 *
 * @param {boolean}  isOpen     - 모달 열림 여부
 * @param {function} onClose    - 모달 닫기 핸들러
 * @param {object}   product    - 수정할 상품 정보 { productId, productName, productStock }
 * @param {function} onSuccess  - 수정 성공 시 콜백 (목록 갱신용)
 */
const UpdateStockModal = ({ isOpen, onClose, product, onSuccess }) => {
  /** 입력 중인 재고 수량 */
  const [newStock, setNewStock] = useState('')
  /** 저장 중 로딩 상태 */
  const [isSaving, setIsSaving] = useState(false)
  /** 에러 메시지 */
  const [errorMsg, setErrorMsg] = useState('')

  // 모달이 열릴 때마다 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setNewStock('')
      setErrorMsg('')
    }
  }, [isOpen])

  /**
   * 입력값 변경 핸들러
   * 숫자만 허용, 음수 방지
   */
  const handleChange = (e) => {
    const val = e.target.value
    // 숫자만 허용 (빈 값 포함)
    if (val === '' || /^\d+$/.test(val)) {
      setNewStock(val)
      setErrorMsg('')
    }
  }

  /**
   * 저장 버튼 클릭 핸들러
   */
  const handleSave = async () => {
    // 입력값 검증
    if (newStock === '') {
      setErrorMsg('재고 수량을 입력해주세요.')
      return
    }

    const stockNum = parseInt(newStock, 10)
    if (stockNum < 0) {
      setErrorMsg('재고는 0 이상이어야 합니다.')
      return
    }

    setIsSaving(true)
    setErrorMsg('')

    try {
      await updateManagerProductStock(product.productId, { stock: stockNum })
      onSuccess()  // 목록 갱신
      onClose()
    } catch (e) {
      const msg = e.response?.data || '재고 수정에 실패했습니다. 다시 시도해주세요.'
      setErrorMsg(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (!product) return null

  // 변경 후 재고와 현재 재고의 차이
  const diff = newStock !== '' ? parseInt(newStock, 10) - product.productStock : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='재고 수정'
      width='420px'
    >
      <div className={styles.body}>
        {/* 상품명 */}
        <div className={styles.productName}>{product.productName}</div>

        {/* 현재 / 변경 후 재고 요약 */}
        <div className={styles.stockSummary}>
          <div className={styles.stockBox}>
            <span className={styles.label}>현재 재고</span>
            <span className={styles.value}>{product.productStock}개</span>
          </div>
          <span className={styles.arrow}>→</span>
          <div className={styles.stockBox}>
            <span className={styles.label}>변경 후</span>
            <span className={`${styles.value} ${styles.newValue}`}>
              {newStock !== '' ? `${newStock}개` : '-'}
            </span>
          </div>
        </div>

        {/* 변경 증감 표시 */}
        {diff !== null && (
          <div className={`${styles.diffMsg} ${diff > 0 ? styles.increase : diff < 0 ? styles.decrease : styles.same}`}>
            {diff > 0 ? `▲ ${diff}개 증가` : diff < 0 ? `▼ ${Math.abs(diff)}개 감소` : '변경 없음'}
          </div>
        )}

        {/* 입력 필드 */}
        <div className={styles.inputWrap}>
          <label className={styles.inputLabel}>변경할 재고 수량</label>
          <input
            type='number'
            className={styles.input}
            value={newStock}
            onChange={handleChange}
            placeholder='수량 입력'
            min={0}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && !isSaving && handleSave()}
          />
        </div>

        {/* 에러 메시지 */}
        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        {/* 버튼 */}
        <div className={styles.btnRow}>
          <Button variant='light' onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button variant='dark' onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UpdateStockModal
