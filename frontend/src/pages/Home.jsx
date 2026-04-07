import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import banner1 from '../assets/banner1.png'
import banner2 from '../assets/banner2.png'
import banner3 from '../assets/banner3.png'
import { getProductList } from '../api/product/product'
import styles from './Home.module.css'

const Home = () => {
  const nav = useNavigate()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    const fetch = async () => {
      const data = await getProductList()
      if (data) setProducts(data)
    }
    fetch()
  }, [])

  return (
    <div>
      {/* 배너 슬라이더 */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation
        loop
      >
        <SwiperSlide><img src={banner1} style={{ width: '100%' }} /></SwiperSlide>
        <SwiperSlide><img src={banner2} style={{ width: '100%' }} /></SwiperSlide>
        <SwiperSlide><img src={banner3} style={{ width: '100%' }} /></SwiperSlide>
      </Swiper>

      {/* 추천 상품 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>추천 상품</h2>
        </div>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ 
            delay: 3000,
            disableOnInteraction: false
          }}
          slidesPerView={4}
          spaceBetween={20}
        >
          {products.map(product => (
            <SwiperSlide key={product.productId}>
              <div
                className={styles.card}
                onClick={() => nav(`/products/${product.productId}`)}
              >
                <div className={styles.imageWrapper}>
                  {product.mainImage
                    ? <img src={product.mainImage} alt={product.productName} className={styles.image} />
                    : <div className={styles.noImage}>이미지 없음</div>
                  }
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{product.productName}</p>
                  <p className={styles.price}>₩ {product.productPrice.toLocaleString()}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default Home