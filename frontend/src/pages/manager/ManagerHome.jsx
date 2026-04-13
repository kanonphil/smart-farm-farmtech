import React, { useEffect, useRef, useState } from 'react'
import styles from './ManagerHome.module.css'
import dayjs from 'dayjs'
import { getMemberCount, getMemberRank, getMonthSales, getOrderStatus, getProductRank, getTodayOrder, getTodayPrice, getTotalMember } from '../../api/dashboardApi'
import CustomBarChart from './CustomBarChart.jsx'
import CustomPieChart from './CustomPieChart.jsx'
import CustomHorizontalBarChart from './CustomHorizontalBarChart.jsx'
import { MdAttachMoney, MdEmojiEvents, MdListAlt, MdPeople, MdPersonAdd, MdShoppingCart, MdShowChart, MdStorefront } from 'react-icons/md'

const ManagerHome = () => {
  // 금일, 전일 회원 수 저장 state 변수
  const [todayMember, setTodayMember] = useState({})
  // 전체 회원 수 저장 state 변수
  const [totalMember, setTotalMember] = useState(0)
  // 금일, 전일 매출 저장 state 변수
  const [todayPrice, setTodayPrice] = useState({})
  // 금일, 전일 주문 건수 저장 state 변수
  const [todayOrder, setTodayOrder] = useState({})
  // 연도 선택 저장 state 변수 (현재 연도로 초기화)
  const [year, setYear] = useState(new Date().getFullYear())
  // 해당 년도 매출 저장 state 변수
  const [monthSales, setMonthSales] = useState([])
  // 주문 상태 저장 state변수
  const [orderStatus, setOrderStatus] = useState({})
  // 회원 별 구매순위 top10 저장 state변수
  const [memberRank, setMemberRank] = useState([])
  // 상품 별 판매순위 top5 저장 state변수
  const [productRank, setProductRank] = useState([])
  // 로딩 true, false state 변수
  const [loading, setLoading] = useState(false)

  /** 마운트 시 모든 데이터 병렬 로딩 */
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [member, total, price, order, sales, status, memRank, prodRank] = await Promise.all([
          // 금일, 전일 회원 수 조회 함수
          getMemberCount(),
          // 전체 회원 수 조회 함수
          getTotalMember(),
          // 금일, 전일 매출 조회함수
          getTodayPrice(),
          // 금일, 전일 주문 건수 조회함수
          getTodayOrder(),
          // 해당 년도 월별 매출 조회함수
          getMonthSales(year),
          // 주문 상태 조회함수
          getOrderStatus(),
          // 회원 별 구매순위 탑10 조회함수
          getMemberRank(),
          // 상품 별 판매 순위 탑5 조회함수
          getProductRank(),
        ])
        setTodayMember(member)
        setTotalMember(total)
        setTodayPrice(price)
        setTodayOrder(order)
        setMonthSales(sales)
        setOrderStatus(status)
        setMemberRank(memRank)
        setProductRank(prodRank)
      } catch (err) {
        console.error('[대시보드] 데이터 로딩 실패', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])  

  /** 연도 변경 시 월별 매출만 재조회 (마운트 시 중복 방지) */
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    getMonthSales(year).then(setMonthSales)
  }, [year])

  /** 비교 수치 계산 */
  const todayMemberDiff = () => todayMember.todayCount   - todayMember.yesterdayCount
  const totalMemberDiff = () => totalMember.totalCount   - totalMember.lastMonthCount
  const todayOrderDiff  = () => todayOrder.todayOrders   - todayOrder.yesterdayOrders
  const todayPriceDiff  = () => {
    if (!todayPrice.yesterdayPrice) return null
    return (todayPrice.todayPrice - todayPrice.yesterdayPrice) / todayPrice.yesterdayPrice * 100
  }

  /** 비교 텍스트 렌더링 헬퍼 */
  const renderDiff = (diff, unit, compareLabel = '전일보다', nullMsg = '전일 데이터 없음') => {
    if (diff === null || diff === undefined || isNaN(diff))
      return <p className={styles.diffNeutral}>{nullMsg}</p>
    if (diff > 0)
      return <p className={styles.diffUp}>▲ {compareLabel} {Math.abs(Math.trunc(diff))}{unit} 증가</p>
    if (diff === 0)
      return <p className={styles.diffNeutral}>{compareLabel} 동일</p>
    return <p className={styles.diffDown}>▼ {compareLabel} {Math.abs(Math.trunc(diff))}{unit} 감소</p>
  }

  /** 요약 카드 정의 */
  const summaryCards = [
    {
      label: '금일 매출',
      value: `${todayPrice.todayPrice?.toLocaleString() ?? 0}원`,
      diff: renderDiff(todayPriceDiff(), '%', '전일보다', '전일 매출 없음'),
      icon: <MdAttachMoney size={22} color='#38bdf8' />,
      iconBg: '#e0f2fe',
      borderColor: '#38bdf8',
    },
    {
      label: '금일 신규 주문',
      value: `${todayOrder?.todayOrders ?? 0}건`,
      diff: renderDiff(todayOrderDiff(), '건'),
      icon: <MdShoppingCart size={22} color='#22c55e' />,
      iconBg: '#dcfce7',
      borderColor: '#22c55e',
    },
    {
      label: '금일 신규 회원',
      value: `${todayMember?.todayCount ?? 0}명`,
      diff: renderDiff(todayMemberDiff(), '명'),
      icon: <MdPersonAdd size={22} color='#a855f7' />,
      iconBg: '#f3e8ff',
      borderColor: '#a855f7',
    },
    {
      label: '전체 회원',
      value: `${totalMember?.totalCount ?? 0}명`,
      diff: renderDiff(totalMemberDiff(), '명', '지난달보다'),
      icon: <MdPeople size={22} color='#f97316' />,
      iconBg: '#ffedd5',
      borderColor: '#f97316',
    },
  ]

  /** 1~12월 차트 데이터 */
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const found = monthSales.find(d => d.month === i + 1)
    return { month: `${i + 1}월`, revenue: found ? found.revenue : 0 }
  })

  /** 랭킹 뱃지 스타일 */
  const getRankClass = (rank) => {
    if (rank === 0) return styles.rankGold
    if (rank === 1) return styles.rankSilver
    if (rank === 2) return styles.rankBronze
    return styles.rankDefault
  }

  /** 상품 판매 순위 차트 데이터 */
  const productChartData = productRank.map(item => ({
    name: item.productName,
    totalQty: item.totalQty,
  }))

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    </div>
  )

  return (
    <div className={styles.container}>

      {/* 페이지 타이틀 */}
      <div className={styles.title}>
        <h2>쇼핑몰 대시보드</h2>
        <p>{dayjs().format('YYYY년 M월 D일')}</p>
      </div>

      {/* 요약 카드 */}
      <div className={styles.standard}>
        {summaryCards.map(({ label, value, diff, icon, iconBg, borderColor }) => (
          <div key={label} className={styles.summaryCard} style={{ borderLeftColor: borderColor }}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{label}</span>
              <div className={styles.cardIconWrap} style={{ background: iconBg }}>{icon}</div>
            </div>
            <p className={styles.cardValue}>{value}</p>
            {diff}
          </div>
        ))}
      </div>

      {/* 월별 매출 + 주문 상태 */}
      <div className={styles.sales_order_div}>
        <div className={styles.sales_div}>
          <div className={styles.sales_select_div}>
            <p className={styles.title_p}>
              <MdShowChart size={18} color='#e41e1e' /> 월별 판매 수익
            </p>
            <select className={styles.year_select} value={year} onChange={e => setYear(e.target.value)}>
              <option value={2026}>2026년</option>
              <option value={2025}>2025년</option>
            </select>
          </div>
          <div className={styles.sales_chart}>
            <CustomBarChart data={chartData} />
          </div>
        </div>

        <div className={styles.order_div}>
          <p className={styles.title_p}>
            <MdListAlt size={18} color='#4277c0' /> 주문 상태 현황
          </p>
          <div className={styles.order_state}>
            <div><p>결제완료</p><p>{orderStatus.paidCount ?? 0}건</p></div>
            <div><p>배송완료</p><p>{orderStatus.shippedCount ?? 0}건</p></div>
            <div><p>구매확정</p><p>{orderStatus.doneCount ?? 0}건</p></div>
            <div><p>구매취소</p><p>{orderStatus.cancelCount ?? 0}건</p></div>
          </div>
          <div>
            <CustomPieChart data={orderStatus} />
          </div>
        </div>
      </div>

      {/* 순위 */}
      <div className={styles.rank_div}>
        <div className={styles.member_rank}>
          <p className={styles.title_p}>
            <MdEmojiEvents size={18} color='#ffee00' /> 회원 구매 순위 TOP 10
          </p>
          <table className={styles.rankTable}>
            <thead>
              <tr>
                <th>순위</th>
                <th>회원명</th>
                <th style={{ textAlign: 'right' }}>구매금액</th>
              </tr>
            </thead>
            <tbody>
              {memberRank.map((item, i) => (
                <tr key={item.memberName ?? i}>
                  <td><div className={getRankClass(i)}>{i + 1}</div></td>
                  <td className={styles.memName}>{item.memberName} 님</td>
                  <td className={styles.totalAmount}>{item.totalAmount?.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.product_rank}>
          <p className={styles.title_p}>
            <MdStorefront size={18} color='#eb3eeb' /> 상품별 판매 TOP 5
          </p>
          <div>
            <CustomHorizontalBarChart data={productChartData} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default ManagerHome