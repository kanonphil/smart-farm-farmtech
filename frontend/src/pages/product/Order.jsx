import React, { useEffect, useState } from 'react'
import Step from '../../components/common/Step'
import styles from './Order.module.css'
import Table from '../../components/common/Table'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Textarea from '../../components/common/Textarea'
import { FaCcAmazonPay } from "react-icons/fa6";
import { insertOrder } from '../../api/orderApi'
import { getAllInfos } from '../../api/member/memberApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import useAuthStore from '../../store/authStore'

const CLIENT_KEY = 'test_ck_DpexMgkW36yZdZdWlB698GbR5ozO'

const Order = () => {
  const nav = useNavigate()
  const { state } = useLocation()

  //주문 정보 저장 state변수
  const [order, setOrder] = useState({})
  //회원 정보 저장 state변수
  const [userData, setUserdata] = useState({})
  //수령인 정보 저장 state변수
  const [receiverInfo, setReceiverInfo] = useState({
    orderId : '',
    recipientName : '',
    recipientPhone : '',
    recipientAddress : '',
    recipientAddressDetail : '',
    deliveryRequest : ''
  })
  //주문 상품 저장 state변수
  const [orderItem, setOrderItem] = useState([])
  //주문인, 수령인 같은지 확인 여부 저장할 state변수
  const [sameAsOrderer, setSameAsOrderer] = useState(false)
  //주문 방법 저장 state변수
  const [paymentMethod, setPaymentMethod] = useState('')
  const { showAlert } = useAuthStore()

  //회원 정보 조회 함수
  const getUser = async () => {
    const response = await getAllInfos();
    setUserdata(response.data)
  }
  
  useEffect(() => {
    if (!state) { nav('/'); return }

    const dataList = state.orderItems.map(item => ({
      imageName: item.img,
      productName: item.productName,
      orderItemPrice: item.productPrice,
      orderItemQty: item.cartItemQty,
      orderItemTotalPrice: item.productPrice * item.cartItemQty
    }))
    setOrderItem(dataList)
    setOrder({ orderTotalPrice: state.totalPrice })
    getUser()
  }, [])

  console.log(order)
  console.log(orderItem)

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
          setReceiverInfo(prev => ({ ...prev, recipientAddress : fullAddress }))
          
          // 상세주소 input에 포커스 (name='addr-detail'로 되어있으므로 수정)
          setTimeout(() => {
            document.querySelector('input[name="addr-detail"]')?.focus()
          }, 100)
        }
      }).open()
    } else {
      showAlert("주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    }
  }

  const headers = [
    [
      { label: '상품명' },
      { label: '가격' },
      { label: '수량' },
      { label: '합계' },
    ]
  ]
  const renderRow = (item, i) => (
    <>
      <td className={styles.img_name_div}>
        <img
          src={item.imageName}
          alt={item.productName}
          className={styles.item_img}
        ></img>
        <p>{item.productName}</p>
      </td>
      <td>
        <p>{item.orderItemPrice}</p>
      </td>
      <td>
        <p>{item.orderItemQty}</p>
      </td>
      <td>
        <p>{item.orderItemTotalPrice}</p>
      </td>
    </>
  )

  //체크박스 핸들러 
  const handleSameAsOrderer = (e) => {
    const checked = e.target.checked
    setSameAsOrderer(checked)
    if (checked) {
      setReceiverInfo({
        ...receiverInfo,
        recipientName : userData.memberName || '',
        recipientPhone : userData.memberPhone || '',
        recipientAddress : userData.memberAddr || '',
        recipientAddressDetail : userData.memberAddrDetail || ''
      })
    } else {
      setReceiverInfo({
        orderId : '',
        recipientName : '',
        recipientPhone : '',
        recipientAddress : '',
        recipientAddressDetail : '',
        deliveryRequest : ''
      })
    }
  }

  const handlePayment = async() => {
    if(!paymentMethod) {
      showAlert('결제수단을 선택해주세요.')
      return
    }
    if (!receiverInfo.recipientName || !receiverInfo.recipientPhone || !receiverInfo.recipientAddress) {
      showAlert('수령인 정보를 입력해주세요')
      return
    }

    // 1. 주문 생성 -> tossOrderId 받기
    const response = await insertOrder({
      orderDTO: { orderTotalPrice: state.totalPrice },
      orderItemDTOList: state.orderItems.map(item => ({
        productId: item.productId,
        orderItemQty: item.cartItemQty,
        orderItemPrice: item.productPrice
      }))
    })
    const tossOrderId = response.data.tossOrderId

    // sessionStrage에 cartItemIds 저장
    const cartItemIds = state.orderItems.map(item => item.cartItemId)
    sessionStorage.setItem('pendingCartItemIds', JSON.stringify(cartItemIds))

    // 2. TossPayments 직접 호출
    const tossPayments = await loadTossPayments(CLIENT_KEY)
    const payment = tossPayments.payment({customerKey: ANONYMOUS})

    await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: order.orderTotalPrice },
        orderId: tossOrderId,
        orderName: orderItem.length > 1
            ? `${orderItem[0].productName} 외 ${orderItem.length - 1}건`
            : orderItem[0].productName,
        customerName: userData.memberName,
        customerEmail: userData.memberEmail,
        successUrl: window.location.origin + '/payment/success',
        failUrl: window.location.origin + '/payment/fail',
    })
  }

  return (
    <div className={styles.container}>
      <Step currentStep={2}/>
      <div>
        <Table
          headers={headers}
          data={orderItem}
          renderRow={renderRow}
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
              value={userData.memberName}
              required
              readOnly
            />
            <Input
              label='이메일'
              value={userData.memberEmail}
              required
              readOnly
            />
            <Input
              label='전화번호'
              value={userData.memberPhone}
              required
              readOnly
            />
            <Input
              label='주소'
              value={userData.memberAddr}
              readOnly
              required
            />
            <Input
              label='상세주소'
              value={userData.memberAddrDetail}
              readOnly
              required
            />
          </div>
          <div>
            <p className={styles.title}>받으시는 분</p>
            
          </div>
          <div className={styles.orderer_div} data-theme = 'light'>
            <label className={styles.label}>
              <input
                type="checkbox" 
                className={styles.checkbox}
                checked={sameAsOrderer} 
                onChange={handleSameAsOrderer} 
              />
              주문자와 동일
            </label>
            <Input
              label='이름'
              value={receiverInfo.recipientName}
              onChange={e => setReceiverInfo({...receiverInfo, recipientName : e.target.value})}
              required
            />
            <Input
              label='전화번호'
              value={receiverInfo.recipientPhone}
              onChange={e => setReceiverInfo({...receiverInfo, recipientPhone : e.target.value})}
              required
            />
            <Input
              label='주소'
              name='addr-addr'
              value={receiverInfo.recipientAddress}
              onClick={handleAddrClick}
              required
            />
            <Input
              label='상세주소'
              value={receiverInfo.recipientAddressDetail}
              onChange={e => setReceiverInfo({...receiverInfo, recipientAddressDetail : e.target.value})}
              required  
            />
            <Textarea
              label='배송시 요청사항'
              value={receiverInfo.deliveryRequest}
              onChange={e => setReceiverInfo({...receiverInfo, deliveryRequest : e.target.value})}
            />
          </div>
        </div>
        <div className={styles.pay_div}>
          <div className={styles.total_div}>
            <p>총 주문금액</p>
            <p>{(order.orderTotalPrice)?.toLocaleString()}원</p>
          </div>
          <p className={styles.pay_method}>결제수단</p>
          <div className={styles.pay_method_div}>
            <div
              className={`${styles.pay_card} ${paymentMethod === '무통장입금' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('무통장입금')}
            >
              <FaCcAmazonPay style={{fontSize : '30px'}}/>
              <p>무통장입금</p>
            </div>
            <div
              className={`${styles.pay_card} ${paymentMethod === '카드' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('카드')}
            >
              <FaCcAmazonPay style={{fontSize : '30px'}}/>
              <p>카드결제</p>
            </div>
          </div>
          <div className={styles.btn_div}>
            <Button
              fullWidth
              variant='success'
              onClick={handlePayment}
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
