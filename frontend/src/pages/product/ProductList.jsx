import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductList } from '../../api/product/product'
import styles from './ProductList.module.css'

/**
 * 상품 목록 페이지
 * - 백엔드 GET /products 호출하여 ACTIVE 상태의 상품 목록을 카드 형태로 표시
 * - TODO: 상품 카드 클릭 시 상품 상세 페이지로 이동
 */
const ProductList = () => {
  const navigate = useNavigate()

  /**
   * @type {[Array, Function]} 상품 목록 상태
   */
  const [products, setProducts] = useState([])

  /**
   * 상품 목록 조회 함수
   * 컴포넌트 마운트 시 1회 실행
   */
  const fetchProducts = async () => {
    const data = await getProductList()
    if (data) setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])
  
  return (
    <div className={styles.container}>
      {/* 페이지 타이틀 */}
      <h2 className={styles.title}>한우 상품</h2>

      {/* 상품 카드 그리드 */}
      <div className={styles.grid}>
        {products.map((product) => (
          <div 
            key={product.productId}
            className={styles.card}
            onClick={() => navigate(`/products/${product.productId}`)}
          >
            {/* 상품 대표 이미지 */}
            <div className={styles.imageWrapper}>
              {product.mainImage ? (
                <img
                  src={`http://localhost:8080/uploads/${product.mainImage}`} 
                  alt={product.productName}
                  className={styles.image}
                />
              ) : (
                // 이미지가 업을 경우 대체 텍스트 표시
                <div className={styles.noImage}>이미지 없음</div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className={styles.info}>
              {/* 상품명 */}
              <p className={styles.name}>{product.productName}</p>

              {/* 상품 가격 (천 단위 콤마 표현) */}
              <p className={styles.price}>
                {product.productPrice.toLocaleString()}원
              </p>

              {/* 재고 상태: 재고가 0이면 품절 표시 */}
              {product.productStock === 0 && (
                <span className={styles.soldOut}>품절</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList