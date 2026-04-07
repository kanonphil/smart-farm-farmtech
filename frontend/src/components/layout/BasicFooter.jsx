import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './BasicFooter.module.css'

const BasicFooter = () => {
  const nav = useNavigate()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.csTitle}>고객센터</p>
          <p className={styles.csNum}>010-0000-0000</p>
          <p className={styles.csTime}>평일 오전 9시 - 오후 6시</p>
          <p className={styles.csTime}>점심시간 낮 12시 - 오후 1시</p>
          <p className={styles.csTime}>주말 및 공휴일 휴무</p>
        </div>

        <div className={styles.right}>
          <p>이용약관 &nbsp;|&nbsp; 개인정보처리방침</p>
          <p>FarmTech | 대표 : 최대표</p>
          <p>E-Mail : farmtech@google.com</p>
          <p>Copyright © FarmTech. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default BasicFooter