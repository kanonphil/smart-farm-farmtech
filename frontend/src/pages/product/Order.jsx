import React, { useEffect, useState } from 'react'
import Step from '../../components/common/Step'
import styles from './Order.module.css'
import Table from '../../components/common/Table'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Textarea from '../../components/common/Textarea'
import { FaCcAmazonPay } from "react-icons/fa6";


const Order = () => {
  //입력값 변경 핸들러
  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'memberPhone') value = formatPhone(value)
    if (field === 'memberBirth') value = formatBirth(value)
    const newForm = {...memberInfo, [field]:value}
    setMemberInfo(newForm)
  }
  
  useEffect(()=>{
    //스크립트가 로드돼 있는지 확인
    const isScriptExist = document.getElementById('daum-postcode-script');
    if(!isScriptExist){
      const script = document.createElement('script');
      script.id = 'daum.postcode-script'
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.body.appendChild(script) ;
    }
  },[])
  
  //주소 입력 변경 핸들러
  const handleAddrClick = () => {
    // window.daum 존재 여부 확인 후 실행
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data) => {
          let fullAddress = data.address
          let extra = ''
          if (data.addressType === 'R') {
            if (data.bname) extra += data.bname
            if (data.buildingName) extra += (extra ? ', ' : '') + data.buildingName
            if (extra) fullAddress += ` (${extra})`
          }
          setMemberInfo(prev => ({ ...prev, memberAddr : fullAddress }))
          
          // 상세주소 input에 포커스 (name='addr-detail'로 되어있으므로 수정)
          setTimeout(() => {
            document.querySelector('input[name="addr-detail"]')?.focus()
          }, 100)
        }
      }).open()
    } else {
      alert("주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    }
  }


  const orderInfo = {
    orderTotalPrice: 35000,
    orderItemDTOList: [
      { img: 'test1.jpg', productName: '유기농 토마토', orderItemQty: 2, orderItemPrice: 12000 },
      { img: 'test2.jpg', productName: '친환경 오이', orderItemQty: 1, orderItemPrice: 11000 }
    ]
  }

    const [orderer, setOrderer] = useState({ name: '홍길동', t1: '010', t2: '1234', t3: '5678' })
    const [receiver, setReceiver] = useState({ name: '김철수', t1: '010', t2: '9876', t3: '5432' })
    const [address, setAddress] = useState({ addr: '서울시 강남구 테헤란로 123', detail: '101호' })

    const getOrder = async () => { /* TODO */ }

    useEffect(() => {
      getOrder()
      return () => { /* TODO: 주문 삭제 */ }
    }, [])

    const handlePayment = async () => { /* TODO */ }

    const headers = [
    [
      { label: '상품명' },
      { label: '가격' },
      { label: '수량' },
      { label: '합계' },
    ]
  ]


  return (
    <div className={styles.container}>
      <Step currentStep={2}/>
      <div>
        <Table
          headers={headers}
        />
      </div>
      <div className={styles.order_info}>
        <div>
          <div>
            <p className={styles.title}>주문하시는 분</p>
          </div>
          <div className={styles.orderer_div} data-theme = 'light'>
            <Input
              label='이름'
              required
            />
            <Input
              label='이메일'
              required
            />
            <Input
              label='전화번호'
              required
            />
            <Input
              label='주소'
              name='addr-addr'
              readOnly
              onClick={handleAddrClick}
              required
            />
            <Input
              label='상세주소'
              required
            />
          </div>
          <div>
            <p className={styles.title}>받으시는 분</p>
          </div>
          <div className={styles.orderer_div} data-theme = 'light'>
            <Input
              label='이름'
              required
            />
            <Input
              label='이메일'
              required
            />
            <Input
              label='전화번호'
              required
            />
            <Input
              label='주소'
              name='addr-addr'
              readOnly
              onClick={handleAddrClick}
              required
            />
            <Input
              label='상세주소'
              required  
            />
            <Textarea
              label='배송시 요청사항  '
            />
          </div>
        </div>
        <div className={styles.pay_div}>
          <div className={styles.total_div}>
            <p>총 주문금액</p>
            <p>90,000원</p>
          </div>
          <p className={styles.pay_method}>결제수단</p>
          <div className={styles.pay_method_div}>
            <div>
              <FaCcAmazonPay style={{fontSize : '30px'}}/>
              <p>일반결제</p>
            </div>
            <div>
              <FaCcAmazonPay style={{fontSize : '30px'}}/>
              <p>토스페이</p>
            </div>
          </div>
          <div className={styles.btn_div}>
            <Button
              fullWidth
              variant='success'
            >주문하기</Button>
            <Button
              fullWidth
              variant='danger'
            >취소</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Order
