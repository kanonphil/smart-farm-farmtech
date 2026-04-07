import React from 'react'
import logo from '../../assets/logo.png'
import styles from './MemberMenu.module.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaTrash } from 'react-icons/fa'
import { decodeToken } from '../../utils/tokenUtils'
import useAuthStore from '../../store/authStore'


const MemberMenu = () => {
  const nav = useNavigate();
  
  // store에서 token 가져오기
  const { token } = useAuthStore()

  const decoded = decodeToken(token)

  return (
    <div className={styles.container}>
      <div className={styles.logo_div}>
        <img src={logo} onClick={e => nav('/')}/>
      </div>
      <div className={styles.profile}>
        <p className={styles.name}>{decoded?.sub}님</p>
        <p className={styles.welcome}>안녕하세요 👋</p>
      </div>
      <ul className={styles.menu_list}>
        <li>
          <NavLink
            to='.'
            end
            className={(param)=> param.isActive ? styles.active : ''}
          >내 정보 수정</NavLink>
        </li>
        <li>
          <NavLink
            to= 'pw'
            className={(param)=> param.isActive ? styles.active : ''}
          >비밀번호 변경</NavLink>
        </li>
        <li>
          <NavLink
            to='./orders'
            className={(param)=> param.isActive ? styles.active : ''}
          >주문 내역</NavLink>
        </li>
        <li>
          <NavLink
            to='./reviews'
            className={(param)=> param.isActive ? styles.active : ''}
          >리뷰 관리</NavLink>
        </li>
      </ul>
      <div className={styles.danger}>
        <FaTrash />
        <span> 회원 탈퇴</span>
      </div>
    </div>
  )
}

export default MemberMenu
