import React, { useEffect, useState } from 'react'
import styles from './ManagerHome.module.css'
import dayjs from 'dayjs'
import { getMemberCount, getMemberRank, getMonthSales, getOrderStatus, getProductRank, getTodayOrder, getTodayPrice, getTotalMember } from '../../api/dashboardApi'
import CustomBarChart from './CustomBarChart.jsx'
import CustomPieChart from './CustomPieChart.jsx'
import CustomHorizontalBarChart from './CustomHorizontalBarChart.jsx'
import { MdAttachMoney, MdEmojiEvents, MdListAlt, MdShowChart, MdStorefront } from 'react-icons/md'

const ManagerHome = () => {
  // 금일, 전일 회원 수 저장 state 변수
  const [todayMember, setTodayMember] = useState({})
  // 전체 회원 수 저장 state 변수
  const [totalMember, setTotalMember] = useState(0)
  // 금일, 전일 매출 저장 state 변수
  const [todayPrice, setTodayPrice] = useState({})
  // 금일, 전일 주문 건수 저장 state 변수
  const [todayOrder, setTodayOrder] = useState({})
  // 연도 선택 저장 state 변수
  const [year, setYear] = useState(2026)
  // 해당 년도 매출 저장 state 변수
  const [monthSales, setMonthSales] = useState([])
  // 주문 상태 저장 state변수
  const [orderStatus, setOrderStatus] = useState({})
  // 회원 별 구매순위 top10 저장 state변수
  const [memberRank, setMemberRank] = useState([])
  // 상품 별 판매순위 top5 저장 state변수
  const [productRank, setProductRank] = useState([])

  // 금일, 전일 회원 수 조회 함수
  const getTodayMember = async () => {
    const response = await getMemberCount()
    setTodayMember(response)
  }
  // 전체 회원 수 조회 함수
  const selectTotalMember = async () => {
    const response = await getTotalMember()
    setTotalMember(response)
  }
  // 금일, 전일 매출 조회함수
  const selectTodayPrice = async () => {
    const response = await getTodayPrice()
    setTodayPrice(response)
  }
  // 금일, 전일 주문 건수 조회함수
  const selectTodayOrder = async () => {
    const response = await getTodayOrder()
    setTodayOrder(response)
  }
  // 해당 년도 월별 매출 조회함수
  const selectMonthSales = async (year) => {
    const response = await getMonthSales(year)
    setMonthSales(response)
  }
  // 주문 상태 조회함수
  const selectOrderStatus = async () => {
    const response = await getOrderStatus()
    setOrderStatus(response)
  }
  // 회원 별 구매순위 탑10 조회함수
  const selectMemberRank = async () => {
    const response = await getMemberRank()
    setMemberRank(response)
  }
  // 상품 별 판매 순위 탑5 조회함수
  const selectProductRank = async () => {
    const response = await getProductRank()
    setProductRank(response)
  }

  useEffect(() => {
    getTodayMember()
    selectTotalMember()
    selectTodayPrice()
    selectTodayOrder()
    selectMonthSales(year)
    selectOrderStatus()
    selectMemberRank()
    selectProductRank()
  }, [])
  

  //연도 변경시 재조회
  useEffect(() => {
    selectMonthSales(year)
  }, [year])

  const todayMemberDiff = () => todayMember.todayCount - todayMember.yesterdayCount
  const totalMemberDiff = () => totalMember.totalCount - totalMember.lastMonthCount
  const todayPriceDiff = () => {
    if(!todayPrice.yesterdayPrice) return null
    return (todayPrice.todayPrice - todayPrice.yesterdayPrice) / todayPrice.yesterdayPrice * 100
  }
  const todayOrderDiff = () => todayOrder.todayOrders - todayOrder.yesterdayOrders

  // 연도 핸들링 함수
  const handleYear = (e) => {
    setYear(e.target.value)
  }  

  // 1~12월 배열 만들어서 없는 달은 0으로 채우기
  const chartData = Array.from({ length: 12 }, (_, i) => {
      const found = monthSales.find(d => d.month === i + 1)
      return {
          month: `${i + 1}월`,
          revenue: found ? found.revenue : 0
      }
  })

  //랭크 별 다른 스타일 변수
  const getRankClass = (rank) => {
    if (rank === 0) return styles.rankGold    
    if (rank === 1) return styles.rankSilver  
    if (rank === 2) return styles.rankBronze  
    return styles.rankDefault
  }

  //상품별 판매 순위 탑5 차트데이터
  const productChartData = productRank.map(item => ({
    'name' : item.productName,
    'totalQty' : item.totalQty
  }))

  console.log(todayMemberDiff())

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>쇼핑몰 대시보드</h2>
        <p>{dayjs().format('YYYY년 M월 D일')}</p>
      </div>
      <div className={styles.standard}>
        <div>
          <p>금일 매출</p>
          <p>{todayPrice.todayPrice?.toLocaleString()}원</p>
          {
            todayPriceDiff() > 0 ?
              <p style={{color : 'green'}}>▲ 전일보다 {Math.trunc(todayPriceDiff())}% 증가</p>
            : todayPriceDiff() === 0 ?
              <p style={{color : 'gray'}}>전일과 동일합니다.</p>
            : todayPriceDiff() === null ?
              <p style={{color : 'gray'}}>전일 매출이 없습니다.</p>
            :
              <p style={{color : 'red'}}>▼ 전일보다 {Math.trunc(todayPriceDiff())}% 감소</p>
          }
        </div>
        <div>
          <p>금일 신규 주문</p>
          <p>{todayOrder?.todayOrders}건</p>
          {
            todayOrderDiff() > 0 ?
              <p style={{color : 'green'}}>▲ 전일보다 {todayOrderDiff()}건 증가</p>
            : todayOrderDiff() === 0 ?
              <p style={{color : 'gray'}}>전일과 동일합니다.</p>
            :
              <p style={{color : 'red'}}>▼ 전일보다 {todayOrderDiff()}건 감소</p>
          }
        </div>
        <div>
          <p>금일 신규 회원</p>
          <p>{todayMember?.todayCount}명</p>
          {
            todayMemberDiff() > 0 ?
              <p style={{color : 'green'}}>▲ 전일보다 {todayMemberDiff()}명 증가</p>
            : todayMemberDiff() === 0 ?
              <p style={{color : 'gray'}}>전일과 동일합니다.</p>
            :
              <p style={{color : 'red'}}>▼ 전일보다 {todayMemberDiff()}명 감소</p>
          }
        </div>
        <div>
          <p>전체 회원</p>
          <p>{totalMember.totalCount}명</p>
          {
            totalMemberDiff() > 0 ?
              <p style={{color : 'green'}}>▲ 지난달보다 {totalMemberDiff()}명 증가</p>
            : totalMemberDiff() === 0 ?
              <p style={{color : 'gray'}}>지난달과 동일함</p>
            :
              <p style={{color : 'red'}}>▼ 지난달보다 {totalMemberDiff()}명 감소</p>
          }
        </div>
      </div>
      <div className={styles.sales_order_div}>
        <div className={styles.sales_div}>
          <div className={styles.sales_select_div}>
            <p className={styles.title_p}>
              <MdShowChart size={18} color='#e41e1e' /> 월별 판매 수익
            </p>
            <select 
              className={styles.year_select}
              value={year}
              onChange={handleYear}
            >
              <option value={2026}>2026년</option>
              <option value={2025}>2025년</option>
            </select>
          </div>
          <div className={styles.sales_chart}>
            <CustomBarChart data = { chartData }/>
          </div>
        </div>
        <div className={styles.order_div}>
          <p className={styles.title_p}>
            <MdListAlt size={18} color='#4277c0' /> 주문 상태 현황
          </p>
          <div className={styles.order_state}>
            <div>
              <p>결제완료</p>
              <p>{orderStatus.paidCount}건</p>
            </div>
            <div>
              <p>배송완료</p>
              <p>{orderStatus.shippedCount}건</p>
            </div>
            <div>
              <p>구매확정</p>
              <p>{orderStatus.doneCount}건</p>
            </div>
            <div>
              <p>구매취소</p>
              <p>{orderStatus.cancelCount}건</p>
            </div>
          </div>
          <div>
            <CustomPieChart data={orderStatus}/>
          </div>
        </div>
      </div>
      <div className={styles.rank_div}>
        <div className={styles.member_rank}>
          <p className={styles.title_p}>
            <MdEmojiEvents size={18} color='#ffee00' /> 회원 구매 순위 TOP 10
          </p>
          <div>
            <table>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '70%' }} />
              </colgroup>
              <thead></thead>
              <tbody>
                {memberRank.map((item, i) => {
                  return(
                    <tr>
                      <td><div
                        className={getRankClass(i)}
                      >{i+1}</div></td>
                      <td className={styles.memName}>{item.memberName} 님</td>
                      <td className={styles.totalAmount}>{item.totalAmount?.toLocaleString()}원</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.product_rank}>
          <div className={styles.title_p}>
            <MdStorefront size={18} color='#eb3eeb' /> 상품별 판매 TOP 5
          </div>
          <div>
            <CustomHorizontalBarChart data={productChartData}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerHome