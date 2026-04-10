import React, { useEffect, useState } from 'react'
import { delProduct, getCategory, getProductListManager, putProduct } from '../../api/product/product'
import styles from './Products.module.css'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { MdCancel, MdCheckCircle, MdInventory } from 'react-icons/md'
import ProductRegisterModal from '../../components/manager/product/ProductRegisterModal'
import ProductEditModal from '../../components/manager/product/ProductEditModal'

/** 페이지당 상품 수 */
const PAGE_SIZE = 8

/**
 * 관리자 상품 목록 페이지
 *
 * 요약 카드 / 카테고리·상태 필터 / 키워드 검색 / 페이지네이션 제공
 * 각 상품에 대해 모달로 수정, 소프트 삭제 처리 가능
 */
const Products = () => {

  /** 상품 목록 및 페이지네이션 */
  const [products,    setProducts]    = useState([])
  const [totalPages,  setTotalPages]  = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  /** 요약 카드 카운트 (필터 무관 전체 기준) */
  const [totalCount,    setTotalCount]    = useState(0)
  const [activeCount,   setActiveCount]   = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)

  /** 카테고리 목록 */
  const [categories, setCategories] = useState([])

  /** 필터 / 검색 */
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus,   setFilterStatus]   = useState('')
  const [inputKeyword,   setInputKeyword]   = useState('') // 입력 중인 값
  const [keyword,        setKeyword]        = useState('') // 실제 적용된 검색어

  /** 수정 모달 */
  const [isModalOpen,   setIsModalOpen]   = useState(false)
  const [selectProduct, setSelectProduct] = useState(null)

  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // ─── 데이터 조회 ────────────────────────────────────────────────

  /**
   * 상품 목록 조회 (필터 + 페이지네이션 적용)
   * filterCategory, filterStatus, keyword, currentPage 변경 시 자동 호출
   */
  const fetchProducts = async (page, category, status, kw) => {
    const response = await getProductListManager({
      categoryId: category || undefined,
      status:     status   || undefined,
      keyword:    kw       || undefined,
      page,
      size: PAGE_SIZE,
    })
    setProducts(response.data.content)
    setTotalPages(response.data.totalPages)
  }

  /**
   * 요약 카드 카운트 조회 (필터 무관 전체 기준)
   * 마운트 시 1회 + 상품 추가/수정/삭제 후 갱신
   */
  const fetchSummary = async () => {
    const [all, active, inactive] = await Promise.all([
      getProductListManager({ page: 0, size: 1 }),
      getProductListManager({ page: 0, size: 1, status: 'ACTIVE' }),
      getProductListManager({ page: 0, size: 1, status: 'INACTIVE' }),
    ])
    setTotalCount(all.data.totalCount)
    setActiveCount(active.data.totalCount)
    setInactiveCount(inactive.data.totalCount)
  }

  /** 카테고리 목록 조회 */
  const fetchCategory = async () => {
    const response = await getCategory()
    setCategories(response.data)
  }

  /** 마운트 시 카테고리 + 요약 카드 초기 조회 */
  useEffect(() => {
    fetchCategory()
    fetchSummary()
  }, [])

  /**
   * 필터·검색·페이지 변경 시 상품 목록 갱신
   * React 18 배치 업데이트로 한 번만 실행됨
   */
  useEffect(() => {
    fetchProducts(currentPage, filterCategory, filterStatus, keyword)
  }, [currentPage, filterCategory, filterStatus, keyword])

  // ─── 핸들러 ─────────────────────────────────────────────────────

  /** 카테고리 필터 변경 → 1페이지로 초기화 */
  const handleCategoryChange = e => {
    setFilterCategory(e.target.value)
    setCurrentPage(0)
  }

  /** 상태 필터 변경 → 1페이지로 초기화 */
  const handleStatusChange = e => {
    setFilterStatus(e.target.value)
    setCurrentPage(0)
  }

  /** 검색어 적용 */
  const handleSearch = () => {
    setKeyword(inputKeyword)
    setCurrentPage(0)
  }

  /** 수정 모달 열기 */
  const handleEdit = product => {
    setSelectProduct(product)
    setIsModalOpen(true)
  }

  /** 삭제 (소프트 삭제) */
  const handleDelete = async productId => {
    const ok = confirm('정말 삭제하시겠습니까?')
    if (!ok) return
    await delProduct(productId)
    fetchProducts(currentPage, filterCategory, filterStatus, keyword)
    fetchSummary()
  }

  /** categoryId → 카테고리명 변환 */
  const getCategoryName = categoryId => {
    const category = categories.find(c => c.categoryId === categoryId)
    return category ? category.categoryName : '-'
  }

  // ─── 테이블 헤더 ─────────────────────────────────────────────────

  const headers = [[
    { label: 'No' },
    { label: '카테고리' },
    { label: '이미지' },
    { label: '상품명' },
    { label: '가격' },
    { label: '재고' },
    { label: '판매량' },
    { label: '상태' },
    { label: '관리' },
  ]]

  // ─── 렌더 ───────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* 헤더 */}
      <div className={styles.titleArea}>
        <h1 className={styles.title}>상품 목록</h1>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={`${styles.iconWrap} ${styles.iconTotal}`}>
            <MdInventory size={22} color='#1565c0' />
          </div>
          <div>
            <p className={styles.summaryCount}>{totalCount}개</p>
            <p className={styles.summaryLabel}>전체 상품</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.iconWrap} ${styles.iconActive}`}>
            <MdCheckCircle size={22} color='#2e7d32' />
          </div>
          <div>
            <p className={styles.summaryCount}>{activeCount}개</p>
            <p className={styles.summaryLabel}>판매중</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.iconWrap} ${styles.iconInactive}`}>
            <MdCancel size={22} color='#9e9e9e' />
          </div>
          <div>
            <p className={styles.summaryCount}>{inactiveCount}개</p>
            <p className={styles.summaryLabel}>판매중지</p>
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={handleCategoryChange}
        >
          <option value=''>전체 카테고리</option>
          {categories.map(c => (
            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={handleStatusChange}
        >
          <option value=''>전체 상태</option>
          <option value='ACTIVE'>판매중</option>
          <option value='INACTIVE'>판매중지</option>
        </select>
        <input
          className={styles.searchInput}
          placeholder='상품명 검색'
          value={inputKeyword}
          onChange={e => setInputKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          variant='primary' 
          size='small' 
          onClick={handleSearch}
        >
          검색
        </Button>
        <Button 
          variant='primary' 
          size='small' 
          style={{ marginLeft: 'auto' }}
          onClick={() => setIsRegisterOpen(true)}
        >
          + 상품 등록
        </Button>
      </div>

      {/* 상품 테이블 */}
      <Table
        headers={headers}
        data={products}
        emptyMessage='상품이 없습니다.'
        renderRow={(product, index) => (
          <>
            <td>{currentPage * PAGE_SIZE + index + 1}</td>
            <td>{getCategoryName(product.categoryId)}</td>
            <td>
              {product.mainImage
                ? <img src={product.mainImage} alt={product.productName} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                : '-'
              }
            </td>
            <td>{product.productName}</td>
            <td>{product.productPrice.toLocaleString()}원</td>
            <td>{product.productStock}</td>
            <td>{product.salesCount}</td>
            <td>
              <span className={product.productStatus === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}>
                {product.productStatus === 'ACTIVE' ? '판매중' : '판매중지'}
              </span>
            </td>
            <td>
              <div className={styles.btnArea}>
                <Button variant='primary' size='small' onClick={() => handleEdit(product)}>수정</Button>
                <Button variant='danger'  size='small' onClick={() => handleDelete(product.productId)}>삭제</Button>
              </div>
            </td>
          </>
        )}
      />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* 상품 등록 모달 */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title='상품 등록'
        width='min(900px, 92vw)'
      >
        <ProductRegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={() => {
            fetchProducts(currentPage, filterCategory, filterStatus, keyword)
            fetchSummary()
          }}
        />
      </Modal>

      {/* 수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='상품 수정'
        width='min(900px, 92vw)'
      >
        {selectProduct && (
          <ProductEditModal
            product={selectProduct}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchProducts(currentPage, filterCategory, filterStatus, keyword)
              fetchSummary()
            }}
          />
        )}
      </Modal>

    </div>
  )
}

export default Products
