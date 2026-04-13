import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCategory, getProductList } from '../../api/product/product'
import styles from './ProductList.module.css'

/**
 * 상품 목록 페이지
 * - 백엔드 GET /products 호출하여 ACTIVE 상태의 상품 목록을 카드 형태로 표시
 * - 정렬 선택 시 즉시 재조회
 * - TODO: 상품 카드 클릭 시 상품 상세 페이지로 이동
 */
const ProductList = () => {
  const navigate = useNavigate()
  // 검색창 keyword 받아오는 함수
  const [searchParams] = useSearchParams()
  // 검색 내용 저장 변수
  const keyword = searchParams.get('keyword') 

  /**
   * @type {[Array, Function]} 상품 목록 상태
   */
  const [products, setProducts] = useState([])

  /**
   * @type {[string|null, Function]} 현재 선택된 정렬 기준
   */
  const [sort, setSort] = useState(null)

  /** 현재 페이지 */
  const [currentPage, setCurrentPage] = useState(1)
  // 카테고리 저장
  const [categories, setCategories] = useState([])
  //선택된 카테고리 저장
  const [selectedCategory, setSelectedCategory] = useState(null)
  // 가격 필터 범위 저장
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  // 가격 필터 적용
  const filteredProducts = products.filter(p => {
    const min = priceRange.min === '' ? 0 : Number(priceRange.min)
    const max = priceRange.max === '' ? Infinity : Number(priceRange.max)
    return p.productPrice >= min && p.productPrice <= max
  })

  const PAGE_SIZE = 8
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)
  /** 현재 페이지에 해당하는 상품 목록 */
  const currentProdcuts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  /**
   * 상품 목록 조회 함수
   * @param {string|null} sortValue - 정렬 기준
   */
  const fetchProducts = async (sortValue, keyword, categoryId) => {
    const data = await getProductList(sortValue, keyword, categoryId)
    if (data) setProducts(data)
  }

  useEffect(() => {
  // 카테고리 목록 최초 1회 조회
  getCategory().then(res => setCategories(res.data))
  }, [])


  useEffect(() => {
    fetchProducts(sort, keyword, selectedCategory)
    setCurrentPage(1)  // 정렬, 검색 바뀌면 1페이지로 리셋
  }, [sort, keyword, selectedCategory])

  /**
   * 정렬 선택 변경 핸들러
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const handleSortChange = (e) => {
    // 빈 문자열(기본값 선택)이면 null로 변환
    const value = e.target.value === "" ? null : e.target.value
    setSort(value)
  }

  


  
  return (
    <div className={styles.container}>
      
      {/* 상단 타이틀 + 정렬 선택 영역 */}
      <div className={styles.header}>
        <h2 className={styles.title}>한우 상품</h2>
  
        {/* 정렬 선택 드롭다운 */}
        <select
          className={styles.sortSelect}
          onChange={handleSortChange}
          value={sort ?? ""}
        >
          <option value="">등록 순</option>
          <option value="sales_desc">판매량 높은 순</option>
          <option value="price_desc">가격 높은 순</option>
          <option value="price_asc">가격 낮은 순</option>
        </select>
        
      </div>
      {/* 카테고리 필터 */}
        <div className={styles.filter}>
          <div className={styles.filter_wrap}>
            <button
              className={`${styles.category_btn} ${selectedCategory === null ? styles.category_active : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat.categoryId}
                className={`${styles.category_btn} ${selectedCategory === cat.categoryId ? styles.category_active : ''}`}
                onClick={() => setSelectedCategory(cat.categoryId)}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
          {/* 가격 범위 필터 */}
          <div className={styles.price_filter}>
            <input
              className={styles.price_input}
              type="number"
              placeholder="최소 가격"
              value={priceRange.min}
              onChange={e => { setPriceRange(prev => ({ ...prev, min: e.target.value })); setCurrentPage(1) }}
            />
            <span className={styles.price_dash}>~</span>
            <input
              className={styles.price_input}
              type="number"
              placeholder="최대 가격"
              value={priceRange.max}
              onChange={e => { setPriceRange(prev => ({ ...prev, max: e.target.value })); setCurrentPage(1) }}
            />
            <span className={styles.price_unit}>원</span>
            {(priceRange.min || priceRange.max) && (
              <button
                className={styles.price_reset}
                onClick={() => { setPriceRange({ min: '', max: '' }); setCurrentPage(1) }}
              >
                초기화
              </button>
            )}
          </div>
        </div>
      {/* 검색어 표시 */}
      {keyword && (
        <div className={styles.search_result}>
          <span className={styles.search_keyword}>"{keyword}"</span> 검색 결과 {products.length}개
        </div>
      )}

      {/* 상품 카드 그리드 */}
      {currentProdcuts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.empty_icon}>🔍</p>
          <p className={styles.empty_text}>검색 결과가 없습니다</p>
          <p className={styles.empty_sub}>다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* 기존 카드 코드 그대로 */}
        </div>
      )}


      {/* 상품 카드 그리드 */}
      <div className={styles.grid}>
        {currentProdcuts.map((product) => (
          <div 
            key={product.productId}
            className={styles.card}
            onClick={() => navigate(`/products/${product.productId}`)}
          >
            {/* 상품 대표 이미지 */}
            <div className={styles.imageWrapper}>
              {product.mainImage ? (
                <img
                  src={product.mainImage}
                  alt={product.productName}
                  className={`${styles.image} ${product.productStock === 0 ? styles.soldOutImage : ''}`}
                />
              ) : (
                <div className={styles.noImage}>이미지 없음</div>
              )}
              {product.productStock === 0 && (
                <div className={styles.soldOutOverlay}>
                  <span className={styles.soldOutText}>SOLD OUT</span>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className={styles.info}>
              <p className={styles.name}>{product.productName}</p>
              <p className={styles.price}>
                {product.productPrice.toLocaleString()}원
              </p>
              {/* 기존 soldOut span 제거 */}
            </div>

          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

          </div>
        )
      }

export default ProductList