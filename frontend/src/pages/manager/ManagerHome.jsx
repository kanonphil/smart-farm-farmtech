import React, { useEffect, useState } from 'react'
import styles from './ManagerHome.module.css'
import dayjs from 'dayjs'
import { getMemberCount, getMonthSales, getTodayOrder, getTodayPrice, getTotalMember } from '../../api/dashboardApi'
import CustomBarChart from './CustomBarChart.jsx'

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

  useEffect(() => {
    getTodayMember()
    selectTotalMember()
    selectTodayPrice()
    selectTodayOrder()
    selectMonthSales(year)
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
            todayMemberDiff() > 0 ?
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
            <p>📈 월별 판매 수익</p>
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
          <p>주문 상태현황</p>
          <div>
            <div>결제완료</div>
            <div>배송완료</div>
            <div>구매확정</div>
            <div>구매취소</div>
          </div>
          <div>
            파이차트
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>최근 주문내역</p>
          <div>최근 주문 top5 테이블</div>
        </div>
        <div>
          <p>재고 부족 상품</p>
          <p>재고 낮은 상품 10개 조회</p>
        </div>
      </div>
      <div>
        <div>
          <p>회원 구매 순위 top 10</p>
          <div>top 10 테이블</div>
        </div>
        <div>
          <div>상품별 판매 top 5</div>
          <div>판매 막대그래프(가로)</div>
        </div>
      </div>
      
    </div>
  )
}

export default ManagerHome