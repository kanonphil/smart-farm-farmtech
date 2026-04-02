import React, { useEffect, useState } from 'react'
import styles from './Cart.module.css'
import Table from '../../components/common/Table'
import { getCartItems } from '../../api/product/product'

const Cart = () => {
  //카트 리스트 저장 state 변수
  const [cartItem, setCartItem] = useState([])

  //카트 리스트 조회 함수
  const getCart = async () => {
    const response = await getCartItems();
    setCartItem(response.data)
  }

  useEffect(()=>{
    getCart()
  },[])

  console.log(cartItem)
  


  const headers = [
    [
      { 
        label: (
          <input 
            type="checkbox" 
          />
        ) 
      },
      { label: '상품명' },
      { label: '가격' },
      { label: '수량' },
      { label: '합계' },
    ]
  ]

  const renderRow = (item, index) => (
    <>
      <td>
        <input 
          type="checkbox" 
        />
      </td>
      <td>{item.name}</td>
      <td>{item.price.toLocaleString()}원</td>
      <td>{item.qty}</td>
      <td>{(item.price * item.qty).toLocaleString()}원</td>
    </>
  )

  const [checked, setChecked] = useState([])



  const data = [
    { name: '유기농 사과', price: 5000, qty: 2 },
    { name: '제주 감귤', price: 3000, qty: 5 },
  ]

  return (
    <div className={styles.container}>
      <Table
        headers={headers}
        data={data}
        renderRow={renderRow}
      />
    </div>
  )
}

export default Cart