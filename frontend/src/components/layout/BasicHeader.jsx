import React from 'react'
import styles from './BasicHeader.module.css'
import logo from '../../assets/logo.png'
import { RiSearchLine } from "react-icons/ri";

const BasicHeader = () => {
  return (
    <div>
      <div className={styles.login_div}>
        <ul>
          <li>...님 반갑습니다.</li>
          <li>회원가입</li>
          <li>로그인</li>
          <li>로그아웃</li>
        </ul>
      </div>
      <div className={styles.logo_div}>
        <img src={logo}/>
      </div>
      <div className={styles.menu}>
        <div>
          <ul>
            <li>한우마루 소개</li>
            <li>공지사항</li>
            <li>베스트상품</li>
            <li>한우</li>
            <li>세트상품</li>
          </ul>
        </div>
        <div className={styles.search_div}>
          <input 
            type="text" 
            className={styles.search} 
            placeholder='상품 입력'  
          />
          <RiSearchLine/>
        </div>
      </div>
    </div>
  )
}

export default BasicHeader