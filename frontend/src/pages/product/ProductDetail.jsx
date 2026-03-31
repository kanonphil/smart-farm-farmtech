import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { getProduct } from '../../api/product/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

const ProductDetail = () => {
  const nav = useNavigate();
  const {productId} = useParams();

  //상품 상세 정보 저장 state 변수
  const [product, setProduct] = useState({})

  //상품 수량 저장 state변수
  const [cnt, setCnt] =useState(1);

  //수량 변경 시 실행함수
  const handleCnt = e => {
    //만약 숫자가 아닌 문자열이 입력되면 입력된 문자열을 빈문자열로 변경
    let cntValue = e.target.value.replace(/[^0-9]/g, '')
    cntValue = cntValue === '' ? '1' : cntValue
    setCnt(cntValue)
    // setCart(prev => ({
    //   ...prev,
    //   cartCnt : cntValue
    // }))
  }

  //-버튼 클릭시
  const minusCnt = e => {
    setCnt(prev => prev <= 1 ? 1 : prev -1)
  }
  //+버튼 클릭시
  const plusCnt = e => {
    setCnt(prev => prev + 1)
  }

  //상품 조회 및 저장된 이미지이름 저장 함수
  const getProductDetail = async () => {
    const response = await getProduct(productId);
    setProduct(response.data)
    for(let e of response.data.productImageList){
      if(e.imageType === 'MAIN'){
        setMainImg(e.imageSavedName)
      }
      if(e.imageType === 'SUB'){
        setSubImg(e.imageSavedName)
      }
      if(e.imageType === 'DETAIL'){
        setDetailImg(e.imageSavedName)
      }
    }
  }

  //메인이미지 저장 state변수
  const [mainImg, setMainImg] = useState('')
  //서브이미지 저장 state변수
  const [subImg, setSubImg] = useState('')
  //상세이미지 저장 state변수
  const [detailImg, setDetailImg] = useState('')
  
  useEffect(()=>{
    getProductDetail()
  }, [])

  console.log(product)


  return (
    <div className={styles.container}>
      <div className={styles.product_div}>
        <div className={styles.img_div}>
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable:true}}
            navigation
            loop
          >
            <SwiperSlide className={styles.imageWrapper}>
              <img 
                src={`http://localhost:8080/uploads/${mainImg}`}
                className={styles.image}  
              />
            </SwiperSlide>
          </Swiper>
        </div>
        <div className={styles.detail_div}>
          <div>{product?.productName}</div>
          <div className={styles.price_div}>
            <div>
              <p>판매가격</p>
              <p>수량</p>
            </div>
            <div>
              <p>{product.productPrice?.toLocaleString()}원</p>
              <div className={styles.cnt_div}>
                <button
                  onClick={e => minusCnt(e)}
                >-</button>
                <input 
                  type="text" 
                  name='cnt'
                  value={cnt}
                  onChange={e => handleCnt(e)}  
                />
                <button
                  onClick={e => plusCnt(e)}
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail