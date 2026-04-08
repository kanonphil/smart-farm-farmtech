import React, { useEffect, useState } from 'react'
import styles from './OrderList.module.css'
import { getOrderList } from '../../api/product/product'    
import { cancelPaymentApi } from '../../api/paymentApi'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Textarea from '../../components/common/Textarea'
import { insertReview } from '../../api/reviewApi'
import Input from '../../components/common/Input'
import { confirmOrder } from '../../api/orderApi'
import Pagination from '../../components/common/Pagination'

const OrderList = () => {
  //조회 시작 날짜 저장변수
  const[startDate, setStartDate] = useState('')
  //조회 엔드 날짜 저장변수
  const[endDate, setEndDate] = useState('')
  //이미지등록 포토리뷰 저장변수 
  const [reviewImage, setReviewImage] = useState();
  //이미지등록 프리뷰
  const [preview,setPreview] =useState();
  
  const[activeBtn, setActiveBtn] = useState(30)

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null })
  const [cancelReason, setCancelReason] = useState('')
  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderItemId: null})
  const [rating, setRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  //내 주문 내역 저장 state변수
  const [orders, setOrders] = useState([])
  /** 구매 확정 처리 중인 주문 ID */
  const [confirmingId, setConfirmingId] = useState(null)

  /** 현재 페이지 (0-based) */
  const [currentPage, setCurrentPage] = useState(0)
  /** 페이지당 주문 수 */
  const PAGE_SIZE = 10
  /** 전체 페이지 수 */
  const totalPages = Math.ceil(orders.length / PAGE_SIZE)

  /** 현재 페이지에 표시할 주문 목록 */
  const displayedOrders = orders.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  /** 주문 목록 변경(날짜 필터 포함) 시 첫 페이지로 초기화 */
  useEffect(() => {
    setCurrentPage(0)
  }, [orders])


  //버튼 클릭 시 날짜변경
  const handlePeriod = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
    setActiveBtn(days)
  }

  useEffect(()=>{
    handlePeriod(30)
  }, [])
  
  //주문 조회 함수
  const fetchOrders = async () => {
    const response = await getOrderList(startDate, endDate)
    setOrders(response.data)
  }

  //시작일, 마지막일 변경 시 주문 조회
  useEffect(() => {
      if (startDate && endDate) fetchOrders()
  }, [startDate, endDate])

  //상태 건수 확인 함수
  const statusCount = (status) => orders.filter(o => o.orderStatus === status).length

  //상태 변환 함수
  const changeStatus = (status) => {
    const map = {
      PAID: '결제완료',
      SHIPPING: '배송중',
      SHIPPED: '배송완료',
      DONE: '구매확정',
      REFUNDED: '환불',
    }
    return map[status] || status
  }

  // 버튼 클릭 핸들러
  const handleCancelClick = (orderId) => {
    setCancelModal({ isOpen: true, orderId })
    setCancelReason('')
  }

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      alert('환불 사유를 입력해주세요')
      return
    }
    await cancelPaymentApi(cancelModal.orderId, cancelReason)
    setCancelModal({ isOpen: false, orderId: null })
    // 목록 새로고침
    fetchOrders()
  }

  const handleReviewClick = (orderItemId) => {
    setReviewModal({ isOpen: true, orderItemId })
    setRating(0)
    setReviewContent('')
    setReviewImage();
    setPreview();
  }

  const handleReviewSubmit = async () => {
    if (rating === 0) { alert('별점을 선택해주세요.'); return }
    if (!reviewContent.trim()) { alert('리뷰 내용을 입력해주세요.'); return }

    const formData = new FormData()
    formData.append('orderItemId', reviewModal.orderItemId);
    formData.append('rating', rating);
    formData.append('content', reviewContent);
    if(reviewImage) formData.append('imgFile',reviewImage);

    await insertReview(formData);
    setReviewModal({ isOpen: false, orderItemId: null})
    alert('리뷰가 등록되었습니다.')
  }

  /**
   * 구매 확정 버튼 클릭 핸들러
   * @param {number} orderId
   */
  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('구매를 확정하시겠습니까?\n확정 후에는 취소할 수 없습니다.')) return
    setConfirmingId(orderId)
    try {
      await confirmOrder(orderId)
      alert('구매가 확정되었습니다.')
      fetchOrders()
    } catch (e) {
      alert(e.response?.data || '구매 확정 처리 중 오류가 발생했습니다.')
    } finally {
      setConfirmingId(null)
    }
  }


  return (
    <div className={styles.container}>
      <h2>주문 내역</h2 >
      <div className={styles.head}>
        <div className={styles.periodBtns}>
          {[
            { label: '1주일', days: 7 },
            { label: '15일', days: 15 },
            { label: '1개월', days: 30 },
            { label: '3개월', days: 90 },
            { label: '6개월', days: 180 },
          ].map(({ label, days }) => (
            <button
              key={days}
              className={`${styles.periodBtn} ${activeBtn === days ? styles.active : ''}`}
              onClick={() => handlePeriod(days)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.dateRange}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <span className={styles.dateSeparator}>~</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>
     
      <div className={styles.statusCards}>
        {[
          { label: '결제완료', key: 'PAID', color: '#4caf50' },
          { label: '배송완료', key: 'SHIPPED', color: '#ff9800' },
          { label: '구매확정', key: 'DONE', color: '#2196f3' },
          { label: '구매취소', key: 'REFUNDED', color: '#9c27b0' },
        ].map(({ label, key, color }) => (
          <div key={key} className={styles.statusCard}>
            <p className={styles.statusLabel} style={{ color }}>{label}</p>
            <p className={styles.statusCount}>{statusCount(key)}건</p>
          </div>
        ))}
      </div>
      {/* 주문 내역 테이블 */}
      <h3 className={styles.title}>주문 내역</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문일</th>
              <th>상품</th>
              <th>수량</th>
              <th>금액</th>
              <th>상태</th>
              <th>취소</th>
              <th>구매 확정</th>
              <th>리뷰</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>주문 내역이 없습니다.</td>
              </tr>
            ) : (
              displayedOrders.map((order, i) =>
                order.orderItemDTOList?.map((item, itemIndex) => (
                  <tr 
                    key={`${order.orderId}-${item.orderItemId}`}
                    style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff' }}
                  >
                    {/* 주문번호, 주문일은 첫 번째 상품 행에만 표시 (rowSpan으로 병합) */}
                    {itemIndex === 0 && (
                      <>
                        <td 
                          rowSpan={order.orderItemDTOList.length}
                          style={{verticalAlign: 'middle'}}
                        >
                          {orders.length - (currentPage * PAGE_SIZE + i)}
                        </td>
                        <td
                          rowSpan={order.orderItemDTOList.length}
                          style={{verticalAlign: 'middle'}}
                        >
                          {order.orderCreatedAt?.split('T')[0]}
                        </td>
                      </>
                    )}

                    {/* 상품별 행 */}
                    <td
                      style={{verticalAlign: 'middle'}}
                    >{item.productName}</td>
                    <td
                      style={{verticalAlign: 'middle'}}
                    >{item.orderItemQty}</td>

                    {/* 금액, 상태, 취소는 첫 번째 상품 행에만 표시 (rowSpan으로 병합) */}
                    {itemIndex === 0 && (
                      <>
                        <td 
                          rowSpan={order.orderItemDTOList.length}
                          style={{verticalAlign: 'middle'}}
                        >
                          {order.orderTotalPrice?.toLocaleString()}원
                        </td>
                        <td 
                          rowSpan={order.orderItemDTOList.length}
                          style={{verticalAlign: 'middle'}}
                        >
                          {changeStatus(order.orderStatus)}
                        </td>
                        <td 
                          rowSpan={order.orderItemDTOList.length}
                          style={{verticalAlign: 'middle'}}
                        >
                          {order.orderStatus === 'PAID' && (
                            <Button
                              variant='danger'
                              size='small'
                              onClick={() => handleCancelClick(order.orderId)}
                            >
                              주문 취소
                            </Button>
                          )}
                        </td>
                      </>
                    )}

                    {/* 기존 취소 버튼 td 뒤에 구매 확정 td 추가 */}
                    {itemIndex === 0 && (
                      <td
                        rowSpan={order.orderItemDTOList.length}
                        style={{ verticalAlign: 'middle' }}
                      >
                        {order.orderStatus === 'SHIPPED' && (
                          <Button
                            variant='primary'
                            size='small'
                            onClick={() => handleConfirmOrder(order.orderId)}
                            disabled={confirmingId === order.orderId}
                          >
                            {confirmingId === order.orderId ? '처리중...' : '구매 확정'}
                          </Button>
                        )}
                        {order.orderStatus === 'DONE' && (
                          <span style={{ fontSize: '0.82rem', color: '#2e7d32', fontWeight: 600 }}>
                            ✓ 구매확정
                          </span>
                        )}
                      </td>
                    )}

                    {/* 리뷰 버튼은 상품별로 각각 표시 */}
                    <td>
                      {order.orderStatus === 'DONE' && (
                        <Button
                          variant='primary'
                          size='small'
                          onClick={() => handleReviewClick(item.orderItemId)}
                          disabled={item.hasReview}
                        >
                          {item.hasReview ? '작성완료' : '리뷰 작성'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        title='주문 취소 (환불)'
        width='480px'
      >
        <p style={{ marginBottom: '12px', color: '#555' }}>환불 사유를 입력해주세요.</p>
        <Textarea
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          placeholder='환불 사유를 입력하세요.'
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <Button variant='secondary' size='small' onClick={() => setCancelModal({ isOpen: false, orderId: null })}>
            닫기
          </Button>
          <Button variant='danger' size='small' onClick={handleCancelConfirm}>
            환불 신청
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, orderItemId: null, productId: null })}
        title='리뷰 작성'
        width='480px'
      >
        <div className={styles.reviewContent}>
          <div>
            <p style={{ marginBottom: '8px' }}>별점</p>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', fontSize: '28px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{ cursor: 'pointer', color: star <= rating ? '#fbbf24' : '#d1d5db' }}
                  onClick={() => setRating(star)}
                >★</span>
              ))}
            </div>
          </div>
          <div className={styles.reviewPreview}>
            {preview && <img src={preview} style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '8px',    // 이미지 둥근 테두리
              objectFit: 'contain',   // 비율 유지하며 박스 안에 맞춤
              display: 'block',
            }}/>}
          </div>
        </div>
        
        <Textarea
          label='리뷰 내용'
          value={reviewContent}
          onChange={e => setReviewContent(e.target.value)}
          placeholder='상품에 대한 솔직한 리뷰를 남겨주세요.'
        />
        <p style={{marginBottom:'10px'}}>사진을 선택해주세요.</p>
        <Input
          type='file'
          accept='image/*'
          onChange={e => {
            const file = e.target.files[0]
            setReviewImage(file);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <Button variant='secondary' size='small' onClick={() => setReviewModal({ isOpen: false, orderItemId: null})}>
            닫기
          </Button>
          <Button variant='primary' size='small' onClick={handleReviewSubmit}>
            등록
          </Button>
        </div>
      </Modal>

    </div>
  )
}

export default OrderList
