import React, { useCallback, useEffect, useState } from 'react'
import { getManagerOrderList, startShipping } from '../../api/orderApi'
import Pagination from '../../components/common/Pagination'
import styles from './OrderManage.module.css'
import useAuthStore from '../../store/authStore'

/**
 * 관리자 주문 관리 페이지
 *
 * 전체 주문 목록을 조회하고
 * PAID 상태 주문에 대해 배송 시작 버튼을 제공한다.
 */
const OrderManage = () => {
  const { showAlert } = useAuthStore()

  /** 주문 목록 */
  const [orders, setOrders] = useState([])
  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false)
  /** 에러 메시지 */
  const [errorMsg, setErrorMsg] = useState('')
  /** 배송 시작 처리 중인 주문 ID */
  const [shippingLoadingId, setShippingLoadingId] = useState(null)
  /** 현재 페이지 (0-based) */
  const [currentPage, setCurrentPage] = useState(0)

  /** 페이지당 항목 수 */
  const PAGE_SIZE = 10

  /**
   * 주문 목록 조회
   */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const response = await getManagerOrderList()
      setOrders(response.data)
    } catch (e) {
      setErrorMsg('주문 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  /** 주문 목록 변경 시 첫 페이지로 초기화 */
  useEffect(() => {
    setCurrentPage(0)
  }, [orders])

  /** 전체 페이지 수 */
  const totalPages = Math.ceil(orders.length / PAGE_SIZE)

  /** 현재 페이지에 표시할 주문 목록 */
  const displayedOrders = orders.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  /**
   * 배송 시작 버튼 클릭 핸들러
   * @param {number} orderId
   */
  const handleShippingStart = async (orderId) => {
    if (!window.confirm(`주문 #${orderId}의 배송을 시작하시겠습니까?`)) return

    setShippingLoadingId(orderId)
    try {
      await startShipping(orderId)
      showAlert('배송이 시작되었습니다.')
      fetchOrders()  // 목록 갱신
    } catch (e) {
      const msg = e.response?.data || '배송 시작 처리 중 오류가 발생했습니다.'
      showAlert(msg)
    } finally {
      setShippingLoadingId(null)
    }
  }

  /**
   * 주문 상태를 한글로 변환
   * @param {string} status
   */
  const getStatusLabel = (status) => {
    const map = {
      PAID: '결제완료',
      SHIPPING: '배송중',
      SHIPPED: '배송완료',
      DONE: '구매확정',
      REFUNDED: '환불',
    }
    return map[status] || status
  }

  /**
   * 상태별 뱃지 클래스 반환
   * @param {string} status
   */
  const getStatusClass = (status) => {
    const map = {
      PAID: styles.badgePaid,
      SHIPPING: styles.badgeShipping,
      SHIPPED: styles.badgeShipped,
      DONE: styles.badgeDone,
      REFUNDED: styles.badgeRefunded,
    }
    return `${styles.badge} ${map[status] || ''}`
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>주문 관리</h1>
        <p className={styles.subtitle}>전체 {orders.length}건 ({currentPage + 1} / {totalPages || 1} 페이지)</p>
      </div>

      {/* 상태 요약 */}
      <div className={styles.summaryRow}>
        {[
          { label: '결제완료', key: 'PAID',     color: styles.dangerCard },
          { label: '배송중',   key: 'SHIPPING', color: styles.warningCard },
          { label: '배송완료', key: 'SHIPPED',  color: styles.infoCard },
          { label: '구매확정', key: 'DONE',     color: styles.safeCard },
          { label: '구매취소', key: 'REFUNDED', color: styles.badCard },
        ].map(({ label, key, color }) => (
          <div key={key} className={`${styles.summaryCard} ${color}`}>
            <span className={styles.summaryLabel}>{label}</span>
            <span className={styles.summaryCount}>
              {orders.filter(o => o.orderStatus === key).length}건
            </span>
          </div>
        ))}
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>주문 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {errorMsg && !isLoading && (
        <div className={styles.errorWrap}>{errorMsg}</div>
      )}

      {/* 주문 테이블 */}
      {!isLoading && !errorMsg && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>주문번호</th>
                <th>회원ID</th>
                <th>주문금액</th>
                <th>주문일시</th>
                <th>결제일시</th>
                <th>배송시작일시</th>
                <th>예상배송완료</th>
                <th>상태</th>
                {/* <th>처리</th> */}
              </tr>
            </thead>
            <tbody>
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>주문 내역이 없습니다.</td>
                </tr>
              ) : (
                displayedOrders.map(order => (
                  <tr key={order.orderId}>
                    <td className={styles.idCell}>#{order.orderId}</td>
                    <td>{order.memberId}</td>
                    <td className={styles.numCell}>
                      {order.orderTotalPrice?.toLocaleString()}원
                    </td>
                    <td>{order.orderCreatedAt?.replace('T', ' ').slice(0, 16)}</td>
                    <td>{order.paidAt?.replace('T', ' ').slice(0, 16) || '-'}</td>
                    <td>{order.shippingStartedAt?.replace('T', ' ').slice(0, 16) || '-'}</td>
                    <td>{order.expectedDeliveredAt?.replace('T', ' ').slice(0, 16) || '-'}</td>
                    <td>
                      {/* PAID 상태일 때만 배송 시작 버튼 표시 */}
                      {order.orderStatus === 'PAID' ? (
                        <button
                          className={styles.shippingBtn}
                          onClick={() => handleShippingStart(order.orderId)}
                          disabled={shippingLoadingId === order.orderId}
                        >
                          {shippingLoadingId === order.orderId ? '처리중...' : '배송 시작'}
                        </button>
                      ) : (
                        <span className={getStatusClass(order.orderStatus)}>
                          {getStatusLabel(order.orderStatus)}
                        </span>
                      )}
                      {/* {order.orderStatus === 'SHIPPING' && (
                        <span className={styles.statusText}>배송 중</span>
                      )}
                      {order.orderStatus === 'SHIPPED' && (
                        <span className={styles.statusText}>배송 완료</span>
                      )}
                      {order.orderStatus === 'DONE' && (
                        <span className={styles.statusText}>구매 확정 완료</span>
                      )} */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && !errorMsg && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default OrderManage
