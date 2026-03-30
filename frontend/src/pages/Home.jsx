import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import banner1 from '../assets/banner1.png'
import banner2 from '../assets/banner2.png'
import banner3 from '../assets/banner3.png'

const Home = () => {
  return (
    <div>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation
        loop
      >
        <SwiperSlide>
          <img src={banner1} style={{ width: '100%'}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={banner2} style={{ width: '100%'}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={banner3} style={{ width: '100%'}} />
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default Home