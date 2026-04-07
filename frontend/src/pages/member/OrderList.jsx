import React, { useEffect, useState } from 'react'
import styles from './OrderList.module.css'
import { getOrderList } from '../../api/product/product'    
import { cancelPaymentApi } from '../../api/paymentApi'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Textarea from '../../components/common/Textarea'

const OrderList = () => {
  //조회 시작 날짜 저장변수
  const[startDate, setStartDate] = useState('')
  //조회 엔드 날짜 저장변수
  const[endDate, setEndDate] = useState('')
  
  const[activeBtn, setActiveBtn] = useState(30)

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null })
  const [cancelReason, setCancelReason] = useState('')

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

  //내 주문 내역 저장 state변수
  const [orders, setOrders] = useState([])
  
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
    if(status === 'PAID'){
      return '결제완료'
    }
    else if(status === 'SHIPPED'){
      return '배송완료'
    }
    else if(status === 'DONE'){
      return '구매확정'
    }
    else if(status === 'CANCEL'){
      return '구매취소'
    }
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
          { label: '구매취소', key: 'CANCEL', color: '#9c27b0' },
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
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>주문 내역이 없습니다.</td>
              </tr>
            ) : (
              orders.map((order, i) => (
                <tr key={order.orderId}>
                  <td>{orders.length - i}</td>
                  <td>{order.orderCreatedAt}</td>
                  <td>{order.orderItemDTOList?.[0]?.productName}</td>
                  <td>{order.orderItemDTOList?.[0]?.orderItemQty}</td>
                  <td>{order.orderTotalPrice?.toLocaleString()}원</td>
                  <td>{changeStatus(order.orderStatus)}</td>
                  <td>{order.orderStatus === 'PAID' && (
                    <Button 
                      variant='danger'
                      size='small'
                      onClick={() => handleCancelClick(order.orderId)}
                    >
                      주문 취소
                    </Button>
                  )}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
    </div>
  )
}

export default OrderList
