import React, { useState } from 'react'
import logo from '../../assets/logo.png'
import styles from './MemberMenu.module.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaTrash } from 'react-icons/fa'
import { decodeToken } from '../../utils/tokenUtils'
import useAuthStore from '../../store/authStore'
import { withdrawMember } from '../../api/member/memberApi'
import ConfirmModal from '../common/ConfirmModal'


const MemberMenu = () => {
  const nav = useNavigate();
  
  // store에서 token 가져오기
  const { token, clearToken, showAlert } = useAuthStore()

  const decoded = decodeToken(token)
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
  const showConfirm = (message, onConfirm) => setConfirmModal({ show: true, message, onConfirm })

  const handleWithdraw = () => {
    showConfirm('정말 탈퇴하시겠습니까? 탈퇴 후에는 복구가 불가능합니다.', async () => {
      const response = await withdrawMember()
      if(response?.status === 200) {
        clearToken()
        showAlert('탈퇴가 완료되었습니다.', () => nav('/'))
      } else {
        showAlert('탈퇴 처리 중 오류가 발생했습니다.')
      }
    })
  }



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
      <div className={styles.danger} onClick={handleWithdraw}>
        <FaTrash />
        <span> 회원 탈퇴</span>
      </div>

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

export default MemberMenu
