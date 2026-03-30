import React from 'react'
import styles from './About.module.css'

const About = () => {
  return (
    <div className={styles.container}>

      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <img 
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600" 
          alt="한우 목장"
          className={styles.heroImg}
        />
        <div className={styles.heroText}>
          <h1>자연이 키운 한우,<br/>한우마루가 전합니다</h1>
          <p>직접 기르고, 직접 확인하고, 직접 전달합니다</p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className={styles.intro}>
        <div className={styles.introContent}>
          <h2>우리가 직접 키웁니다</h2>
          <p>
            한우마루는 중간 유통 없이 자체 목장에서 직접 한우를 사육합니다.<br/>
            넓은 초지에서 자유롭게 자란 한우는 스트레스 없이 건강하게 성장하며,
            그 차이는 고기 한 점에서 고스란히 느껴집니다.
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800" 
          alt="목장 한우"
          className={styles.introImg}
        />
      </section>

      {/* 모니터링 섹션 */}
      <section className={styles.monitor}>
        <img 
          src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800" 
          alt="스마트 목장"
          className={styles.monitorImg}
        />
        <div className={styles.monitorContent}>
          <h2>24시간 스마트 모니터링</h2>
          <p>
            한우마루는 IoT 센서 기반의 스마트팜 시스템을 도입하여<br/>
            온도, 습도, 공기질을 실시간으로 측정하고 최적의 환경을 유지합니다.<br/><br/>
            단 한 순간도 놓치지 않는 상시 모니터링 덕분에<br/>
            우리 한우는 언제나 최상의 환경에서 건강하게 자랍니다.
          </p>
          <ul className={styles.monitorList}>
            <li>🌡️ 실시간 온도·습도 관리</li>
            <li>💨 공기질 자동 제어 시스템</li>
            <li>📱 이상 징후 즉시 알림</li>
            <li>📊 누적 데이터 기반 환경 최적화</li>
          </ul>
        </div>
      </section>

      {/* 수치 섹션 */}
      <section className={styles.stats}>
        <div className={styles.statItem}>
          <h3>15년+</h3>
          <p>직접 사육 경력</p>
        </div>
        <div className={styles.statItem}>
          <h3>24/7</h3>
          <p>스마트 모니터링</p>
        </div>
        <div className={styles.statItem}>
          <h3>100%</h3>
          <p>국내산 한우</p>
        </div>
        <div className={styles.statItem}>
          <h3>0단계</h3>
          <p>중간 유통 없음</p>
        </div>
      </section>

      {/* 마무리 */}
      <section className={styles.closing}>
        <img 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200" 
          alt="한우 고기"
          className={styles.closingImg}
        />
        <div className={styles.closingText}>
          <h2>"정직하게 키우고,<br/>자신 있게 내놓습니다"</h2>
          <p>한우마루의 약속입니다</p>
        </div>
      </section>

    </div>
  )
}

export default About