import React from 'react'
import StockStatusBadge from './StockStatusBadge'
import Button from '../../common/Button'
import styles from './StockTable.module.css'

/**
 * 재고 관리 테이블 컴포넌트
 *
 * @param {Array}    products        - 상품 목록
 * @param {function} onEditClick     - 재고 수정 버튼 클릭 핸들러 (product 전달)
 */
const StockTable = ({ products, onEditClick }) => {
  /**
   * 재고 수량에 따라 행 강조 CSS 클래스 반환
   * @param {number} stock
   */
  const getRowClass = (stock) => {
    if (stock <= 10) return styles.dangerRow
    if (stock <= 30) return styles.warningRow
    return ''
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>ID</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th>가격</th>
            <th>상태</th>
            <th className={styles.stockCol}>재고</th>
            <th>재고 상태</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.productId} className={getRowClass(product.productStock)}>
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
                <Button
                  variant='dark'
                  size='small'
                  onClick={() => onEditClick(product)}
                >
                  재고 수정
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StockTable
