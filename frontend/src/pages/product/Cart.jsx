import React, { useEffect, useState } from 'react'
import styles from './Cart.module.css'
import Table from '../../components/common/Table'
import { getCartItems, putCnt } from '../../api/product/product'

const Cart = () => {
  //카트 리스트 저장 state 변수
  const [cartItem, setCartItem] = useState([])

  //카트 리스트 조회 함수
  const getCart = async () => {
    const response = await getCartItems();

    const dataList = response.data.map((item, index) => {
      return {
        cartItemId : item.cartItemDTOList[0].cartItemId,
        productName : item.cartItemDTOList[0].product.productName,
        productPrice : item.cartItemDTOList[0].product.productPrice,
        cartItemQty : item.cartItemDTOList[0].cartItemQty,
        img : item.cartItemDTOList[0].product.productImageList[0].imageSavedName
      }
    })
    setCartItem(dataList)
  }

  useEffect(()=>{
    getCart()
  },[])

  console.log(cartItem)

  //수량과 카트번호 저장 state변수
  const [cntAndCartNum, setCntAndCartNum] = useState({
    cartItemQty : 0,
    cartItemId : 0
  })

  //수량 변경 시 실행함수
  const handleCnt = (e, item) => {
    //만약 숫자가 아닌 문자열이 입력되면 입력된 문자열을 빈문자열로 변경
    let cntValue = e.target.value.replace(/[^0-9]/g, '')
    cntValue = cntValue === '' ? '1' : Number(cntValue)
    if(cntValue > 99) {
      cntValue = 99
      alert('최대 구매 수량은 99개입니다.')
    }
    setCntAndCartNum({
      cartItemQty : cntValue,
      cartItemId : item.cartItemId
    })
  }

  // -버튼 클릭시
  const minusCnt = (e, item) => {
    setCntAndCartNum({
      cartItemQty : item.cartItemQty - 1,
      cartItemId : item.cartItemId
    })
  }
  //+버튼 클릭시
  const plusCnt = (e, item) => {
    setCntAndCartNum({
      cartItemQty : item.cartItemQty + 1,
      cartItemId : item.cartItemId
    })
  }

  const updateCnt = async (data) => {
    await putCnt(data)
  }
  useEffect(()=>{
    if (cntAndCartNum.cartItemId === 0) return
    const update = async () => {
    await updateCnt(cntAndCartNum)
    await getCart()
  }
  update()
  }, [cntAndCartNum])



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
        <div>

        </div>
      </td>
      <td className={styles.img_name_div}>
        <img
          src = {`http://localhost:8080/uploads/${item.img}`}
          className={styles.item_img}
        />
        <p>{item.productName}</p>
      </td>
      <td>{item.productPrice}원</td>
      <td>
        <div className={styles.cnt_div}>
          <button className={styles.cnt_btn} onClick={e => minusCnt(e, item)}>-</button>
          <input
            type="text"
            name='cnt'
            value={item.cartItemQty}
            onChange={e => handleCnt(e, item)}
            className={styles.cnt_input}
          />
          <button className={styles.cnt_btn} onClick={e => plusCnt(e, item)}>+</button>
        </div>
      </td>
      <td className={styles.total_price}>
        {(item.productPrice * item.cartItemQty).toLocaleString()}원
      </td>
    </>
  )

  return (
    <div className={styles.container}>
      <Table
        headers={headers}
        data={cartItem}
        renderRow={renderRow}
        className={styles.cart_table}
      />
    </div>
  )
}

export default Cart
