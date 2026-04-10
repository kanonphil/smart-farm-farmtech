import React from 'react'
import StockStatusBadge from './StockStatusBadge'
import Button from '../../common/Button'
import Table from '../../common/Table'
import styles from './StockTable.module.css'

/**
 * 재고 관리 테이블 컴포넌트
 * @param {Array}    products    - 상품 목록
 * @param {Function} onEditClick - 재고 수정 버튼 클릭 핸들러 (product 전달)
 */
const StockTable = ({ products, onEditClick }) => {
  /**
   * 재고 수량에 따라 행 강조 CSS 클래스 반환
   * @param {object} product
   */
  const getRowClass = (product) => {
    if (product.productStock <= 10) return styles.dangerRow
    if (product.productStock <= 30) return styles.warningRow
    return ''
  }

  return (
    <Table
      headers={[[
        { label: 'ID' },
        { label: '상품명' },
        { label: '카테고리' },
        { label: '가격' },
        { label: '상태' },
        { label: '재고' },
        { label: '재고 상태' },
        { label: '수정' },
      ]]}
      data={products}
      getRowClass={getRowClass}
      emptyMessage='등록된 상품이 없습니다.'
      renderRow={(product) => (
        <>
          <td className={styles.idCell}>{product.productId}</td>
          <td className={styles.nameCell}>{product.productName}</td>
          <td>{product.categoryName}</td>
          <td className={styles.numCell}>{product.productPrice.toLocaleString()}원</td>
          <td>
            <span className={product.productStatus === 'ACTIVE' ? styles.activeTag : styles.inactiveTag}>
              {product.productStatus === 'ACTIVE' ? '판매중' : '판매중지'}
            </span>
          </td>
          <td className={`${styles.numCell} ${styles.stockCell}`}>
            {product.productStock.toLocaleString()}
          </td>
          <td>
            <StockStatusBadge stock={product.productStock} />
          </td>
          <td>
            <Button variant='dark' size='small' onClick={() => onEditClick(product)}>
              재고 수정
            </Button>
          </td>
        </>
      )}
    />
  )
}

export default StockTable
