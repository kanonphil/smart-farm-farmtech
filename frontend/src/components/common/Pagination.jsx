import React from 'react'
import styles from './Pagination.module.css'

/**
 * 페이지네이션 컴포넌트
 * 
 * @param {number} currentPage - 현재 페이지 번호 (0-based)
 * @param {number} totalPages - 전체 페이지 수
 * @param {function} onPageChange - 페이지 변경 핸들러 (pageNumber 전달)
 */
const Pagenation = ({currentPage, totalPages, onPageChange}) => {
  if (totalPages <= 1) return null

  // 표시할 페이지 번호 범위 계산 (현재 페이지 기준 앞뒤 2개)
  const pageRange = 5
  const startPage = Math.max(0, currentPage - Math.floor(pageRange / 2))
  const endPage = Math.min(totalPages - 1, startPage + pageRange - 1)

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return (
    <div className={styles.pagination}>
      {/* 이전 버튼 */}
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        &lt;
      </button>

      {/* 첫 페이지 */}
      {startPage > 0 && (
        <>
          <button className={styles.pageBtn} onClick={() => onPageChange(0)}>1</button>
          {startPage > 1 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {/* 페이지 번호 목록 */}
      {pages.map(page => (
        <button
          key={page}
          className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}

      {/* 마지막 페이지 */}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && <span className={styles.ellipsis}>...</span>}
          <button className={styles.pageBtn} onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 버튼 */}
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        &gt;
      </button>
    </div>
  )
}

export default Pagenation