import React, { useEffect, useState } from 'react'
import styles from './OrderList.module.css'

const OrderList = () => {
  //조회 시작 날짜 저장변수
  const[startDate, setStartDate] = useState('')
  //조회 엔드 날짜 저장변수
  const[endDate, setEndDate] = useState('')

  //버튼 클릭 시 날짜변경
  const handlePeriod = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }

  useEffect(()=>{
    handlePeriod(30)
  }, [])


  return (
    <div className={styles.container}>
      <h3>주문 현황</h3>
      <div>
        <button
          onClick={() => handlePeriod(7)}
        >1주일</button>
        <button
          onClick={() => handlePeriod(15)}
        >15일</button>
        <button
          onClick={() => handlePeriod(30)}
        >1개월</button>
        <button
          onClick={() => handlePeriod(90)}
        >3개월</button>
        <button
          onClick={() => handlePeriod(180)}
        >6개월</button>
      </div>
      <div>
        <input 
          type="date" 
          value={startDate}
          onChange={e => setStartDate(e.target.value)}  
        />
        <input 
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)} 
          
        />
      </div>
      <div>
        <div>
          <p>결제완료</p>
          <p>0건</p>
        </div>
        <div>
          <p>상품준비중</p>
          <p>0건</p>
        </div>
        <div>
          <p>배송중</p>
          <p>0건</p>
        </div>
        <div>
          <p>배송완료</p>
          <p>0건</p>
        </div>
      </div>
      <h3>주문 내역</h3>
      <div>
        <table>

        </table>
      </div>
    </div>
  )
}

export default OrderList
