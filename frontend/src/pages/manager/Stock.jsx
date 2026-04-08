import React, { useCallback, useEffect, useState } from 'react'
import { getManagerProductStocks } from '../../api/managerApi'
import StockTable from '../../components/manager/stock/StockTable'
import Pagination from '../../components/common/Pagination'
import UpdateStockModal from '../../components/manager/stock/UpdateStockModal'
import styles from './Stock.module.css'

/** 페이지당 표시할 상품 수 */
const PAGE_SIZE = 10

/**
 * 관리자 재고 관리 페이지
 * 
 * 상품 목록을 재고 오름차순으로 표시하고
 * 재고 부족 상품을 시각적으로 강조한다.
 * 각 상품에 대해 모달로 재고를 수정할 수 있다.
 */
const Stock = () => {
  /** 현재 페이지 번호 (0-based) */
  const [currentPage, setCurrentPage] = useState(0)
  /** 전체 페이지 수 */
  const [totalPages, setTotalPages] = useState(0)
  /** 전체 상품 수 */
  const [totalElements, setTotalElements] = useState(0)
  /** 상품 목록 */
  const [products, setProducts] = useState([])
  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false)
  /** 에러 메시지 */
  const [errorMsg, setErrorMsg] = useState('')
  /** 재고 수정 모달 열림 여부 */
  const [modalOpen, setModalOpen] = useState(false)
  /** 수정 대상 상품 */
  const [selectedProduct, setSelectedProduct] = useState(null)
  /** 재고 상태별 전체 집계 */
  const [stockSummary, setStockSummary] = useState({ dangerCount: 0, warningCount: 0, safeCount: 0 })

  /**
   * 재고 목록 조회
   * useCallback으로 의존성 있을 때만 재생성
   */
  const fetchStockList = useCallback(async (page) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await getManagerProductStocks({ page, size: PAGE_SIZE })
      const data = response.data
      setProducts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setStockSummary({
        dangerCount: data.dangerCount,
        warningCount: data.warningCount,
        safeCount: data.safeCount,
      })
    } catch (error) {
      console.error('재고 조회 에러:', error)
      setErrorMsg('재고 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 페이지 변경 시 목록 재조회
  useEffect(() => {
    fetchStockList(currentPage)
  }, [currentPage, fetchStockList])

  /**
   * 페이지 변경 핸들러
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  /**
   * 재고 수정 버튼 클릭 핸들러
   * @param {object} product - 선택된 상품
   */
  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  /**
   * 수정 성공 후 현재 페이지 목록 갱신
   */
  const handleStockUpdateSuccess = () => {
    fetchStockList(currentPage)
  }
  
  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>재고 관리</h1>
        <p className={styles.subtitle}>
          전체 {totalElements}개 상품 · 재고 오름차순 정렬
        </p>
      </div>

      {/* 재고 상태 요약 카드 */}
      <div className={styles.summaryRow}>
      <div className={`${styles.summaryCard} ${styles.dangerCard}`}>
        <span className={styles.summaryLabel}>⚠️ 위험 (0~9개)</span>
        <span className={styles.summaryCount}>{stockSummary.dangerCount}개 상품</span>
      </div>
      <div className={`${styles.summaryCard} ${styles.warningCard}`}>
        <span className={styles.summaryLabel}>🔔 주의 (10~49개)</span>
        <span className={styles.summaryCount}>{stockSummary.warningCount}개 상품</span>
      </div>
      <div className={`${styles.summaryCard} ${styles.safeCard}`}>
        <span className={styles.summaryLabel}>✅ 안정 (50개 이상)</span>
        <span className={styles.summaryCount}>{stockSummary.safeCount}개 상품</span>
      </div>
    </div>


      {/* 로딩 */}
      {isLoading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>재고 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {errorMsg && !isLoading && (
        <div className={styles.errorWrap}>{errorMsg}</div>
      )}

      {/* 목록 비어있음 */}
      {!isLoading && !errorMsg && products.length === 0 && (
        <div className={styles.emptyWrap}>등록된 상품이 없습니다.</div>
      )}

      {/* 재고 테이블 */}
      {!isLoading && !errorMsg && products.length > 0 && (
        <>
          <StockTable products={products} onEditClick={handleEditClick} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* 재고 수정 모달 */}
      <UpdateStockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        onSuccess={handleStockUpdateSuccess}
      />
    </div>
  )
}

export default Stock