import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import { getProduct, getProductReviews, getReviewStats, insertCartItem, insertOrder } from '../../api/product/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Pagination, Thumbs } from 'swiper/modules';
import AlertModal from '../../components/common/AlertModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import useAuthStore from '../../store/authStore';


const ProductDetail = () => {
  const nav = useNavigate();
  const {productId} = useParams();

  //상품 상세 정보 저장 state 변수
  const [product, setProduct] = useState({})
  //상품 수량 저장 state변수
  const [cnt, setCnt] =useState(1);
  //swiper thumb이미지 저장
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  //탭 저장
  const [activeTab, setActiveTab] = useState('info')
  //리뷰 저장
  const [reviews, setReviews] = useState([])
  //리뷰 스탯 저장
  const [reviewStats, setReviewStats] = useState({})
  //alert modal state
  const [alertModal, setAlertModal] = useState({ show: false, message: '' })
  //confirm modal state
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
  //token 저장
  const { token, setCartCount } = useAuthStore()

  //수량 변경 시 실행함수
  const handleCnt = e => {
    let cntValue = e.target.value.replace(/[^0-9]/g, '')
    cntValue = cntValue === '' ? '1' : Number(cntValue)
    if(cntValue < 1) cntValue = 1
    if(cntValue > product.productStock) {
      cntValue = product.productStock
      showAlert(`최대 구매 가능 수량은 ${product.productStock}개입니다.`)
    }
    setCnt(cntValue)
  }

  //-버튼 클릭시
  const minusCnt = e => {
    if(cnt <= 1) {
      showAlert('최소 구매 수량은 1개입니다.')
      return
    }
    setCnt(prev => prev - 1)
  }

  //+버튼 클릭시
  const plusCnt = e => {
    if(cnt >= product.productStock) {
      showAlert(`최대 구매 가능 수량은 ${product.productStock}개입니다.`)
      return
    }
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
    getProductReviews(productId).then(res => setReviews(res.data))
    getReviewStats(productId).then(res => setReviewStats(res.data))
  }, [])

  //장바구니 담기 버튼 클릭 시 실행함수
  const addCartItem = async () => {
    const cartItem = {
      productId : product.productId,
      cartItemQty : cnt
    }
    const response = await insertCartItem(cartItem)
    if(response.status === 200){
      setCartCount(prev => prev + 1)
      showConfirm('장바구니 저장 완료! 장바구니로 이동 하시겠습니까?', () => nav('/cart'))
    }
    else{
      showAlert('실패')
    }
  }

  //바로 구매 클릭 시 실행함수
  const buyNow = async () => {
    if(!token) {
      showConfirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?', () => nav('/login'))
      return
    }
    showAlert('주문서 작성 페이지로 이동합니다.', () => nav('/order', {
      state: {
        orderItems: [{
          productId: product.productId,
          productName: product.productName,
          productPrice: product.productPrice,
          cartItemQty: cnt,
          cartItemId: null,
          img: mainImg
        }],
        totalPrice: product.productPrice * cnt
      }
    }))
  }

  // 헬퍼 함수 추가 (alert 대신 사용)
  const showAlert = (message, callback) => setAlertModal({ show: true, message, callback })

  // 헬퍼 함수 추가 (confirm 대신 사용)
  const showConfirm = (message, onConfirm) => setConfirmModal({ show: true, message, onConfirm })



  return (
  <div className={styles.container}>
    <div className={styles.product_div}>

      {/* 이미지 */}
      <div className={styles.img_div}>
        {/* 메인 큰 이미지 */}
        <Swiper
          modules={[Navigation, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation
          className={styles.mainSwiper}
        >
          {mainImg && (
            <SwiperSlide className={styles.imageWrapper}>
              <img src={mainImg} className={styles.image} alt="메인 이미지" />
            </SwiperSlide>
          )}
          {subImg && (
            <SwiperSlide className={styles.imageWrapper}>
              <img src={subImg} className={styles.image} alt="서브 이미지" />
            </SwiperSlide>
          )}
        </Swiper>

        {/* 썸네일 */}
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={3}
          freeMode
          watchSlidesProgress
          className={styles.thumbSwiper}
        >
          {mainImg && (
            <SwiperSlide className={styles.thumbSlide}>
              <img src={mainImg} className={styles.thumbImg} alt="메인" />
            </SwiperSlide>
          )}
          {subImg && (
            <SwiperSlide className={styles.thumbSlide}>
              <img src={subImg} className={styles.thumbImg} alt="서브" />
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* 상품 정보 */}
      <div className={styles.detail_div}>

        <p className={styles.product_name}>{product?.productName}</p>

        {/* 가격 */}
        <div className={styles.price_section}>
          <span className={styles.info_label}>판매가격</span>
          <span className={styles.price}>{product.productPrice?.toLocaleString()}원</span>
        </div>

        {/* 수량 */}
        <div className={styles.qty_section}>
          <span className={styles.info_label}>수량</span>
          <div className={styles.qty_control}>
            <button className={styles.qty_btn} onClick={minusCnt}>−</button>
            <input
              className={styles.qty_input}
              type="text"
              name="cnt"
              value={cnt}
              onChange={handleCnt}
              disabled={product.productStock === 0}
            />
            <button className={styles.qty_btn} onClick={plusCnt}>+</button>
          </div>
        </div>
        <div className={styles.stock_info}>
          {product.productStock === 0
            ? <span className={styles.stock_empty}>품절</span>
            : product.productStock <= 10
              ? <span className={styles.stock_low}>재고 {product.productStock}개 남음</span>
              : <span className={styles.stock_available}>재고 {product.productStock}개</span>
          }
        </div>



        {/* 총 구매가격 */}
        <div className={styles.total_section}>
          <span className={styles.total_label}>총 구매가격</span>
          <span className={styles.total_price}>
            {(product.productPrice * cnt)?.toLocaleString()}<span>원</span>
          </span>
        </div>

        {/* 버튼 */}
        <div className={styles.btn_div}>
          <button className={styles.btn_buy} onClick={buyNow} disabled={product.productStock === 0}>바로 구매</button>
          <button className={styles.btn_cart} onClick={addCartItem} disabled={product.productStock === 0}>장바구니</button>
        </div>

      </div>
    </div>

    {/* 탭 */}
    <div className={styles.tab_wrap}>
      <button
        className={`${styles.tab_btn} ${activeTab === 'info' ? styles.tab_active : ''}`}
        onClick={() => setActiveTab('info')}
      >
        상품정보
      </button>
      <button
        className={`${styles.tab_btn} ${activeTab === 'review' ? styles.tab_active : ''}`}
        onClick={() => setActiveTab('review')}
      >
        상품리뷰
      </button>
    </div>

    {/* 탭 컨텐츠 */}
    <div className={styles.tab_content}>
      {activeTab === 'info' && (
        <div className={styles.detail_section}>
          {detailImg
            ? <img src={detailImg} className={styles.detail_img} alt="상세 이미지" />
            : <p className={styles.empty}>상세 이미지가 없습니다.</p>
          }
        </div>
      )}

      {activeTab === 'review' && (
        <div className={styles.review_section}>
          {/* 평점 요약 */}
          <div className={styles.rating_summary}>
            <div className={styles.rating_left}>
              <span className={styles.rating_big}>{Number(reviewStats.avgRating || 0).toFixed(1)}</span>
              <div className={styles.rating_stars_row}>
                {'★'.repeat(Math.round(reviewStats.avgRating || 0))}{'☆'.repeat(5 - Math.round(reviewStats.avgRating || 0))}
              </div>
              <span className={styles.rating_total}>총 {reviewStats.totalCount || 0}개의 리뷰</span>
            </div>

            <div className={styles.rating_right}>
              {[5,4,3,2,1].map(star => {
                const key = ['one','two','three','four','five'][star-1]
                const count = reviewStats[key] || 0
                const percent = reviewStats.totalCount ? (count / reviewStats.totalCount) * 100 : 0
                return (
                  <div key={star} className={styles.rating_bar_row}>
                    <span className={styles.rating_bar_label}>{star}★</span>
                    <div className={styles.rating_bar_bg}>
                      <div className={styles.rating_bar_fill} style={{width: `${percent}%`}} />
                    </div>
                    <span className={styles.rating_bar_count}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {reviews.length === 0 ? (
            <p className={styles.empty}>아직 작성된 리뷰가 없습니다.</p>
          ) : (
            <ul className={styles.review_list}>
              {reviews.map(review => (
                <li key={review.reviewId} className={styles.review_card}>
                  <img
                    src={review.imageUrl || mainImg}
                    alt="리뷰 이미지"
                    className={styles.review_img}
                  />
                  <div className={styles.review_body}>
                    <div className={styles.review_header}>
                      <span className={styles.review_author}>{review.memberName}</span>
                    </div>
                    <div className={styles.review_stars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className={styles.review_content}>{review.content}</p>
                  </div>
                  <span className={styles.review_date}>
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
    <AlertModal
      show={alertModal.show}
      message={alertModal.message}
      onClose={() => {
        alertModal.callback?.()
        setAlertModal({ show: false, message: '', callback: null })
      }}
    />
    <ConfirmModal
      show={confirmModal.show}
      message={confirmModal.message}
      onConfirm={() => {
        confirmModal.onConfirm?.()
        setConfirmModal({ show: false, message: '', onConfirm: null })
      }}
      onClose={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
    />
  </div>
)
}

export default ProductDetail