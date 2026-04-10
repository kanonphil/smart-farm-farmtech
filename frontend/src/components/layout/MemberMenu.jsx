import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styles from './MemberMenu.module.css'
import logo from '../../assets/logo-dark.png'
import { decodeToken } from '../../utils/tokenUtils'
import useAuthStore from '../../store/authStore'
import { withdrawMember } from '../../api/member/memberApi'
import ConfirmModal from '../common/ConfirmModal'
import {
  MdPerson, MdLock, MdListAlt, MdRateReview,
  MdHome, MdExitToApp
} from 'react-icons/md'
import NotificationBell from '../common/NotificationBell'

/**
 * 일반 회원 마이페이지 사이드바 메뉴
 * - ManagerMenu와 동일한 다크 사이드바 디자인
 * - 내 정보 수정 / 비밀번호 변경 / 주문 내역 / 리뷰 관리
 * - 하단: 메인 사이트 이동 / 회원 탈퇴
 */
const MemberMenu = () => {
  const nav = useNavigate()
  const { token, clearToken, showAlert } = useAuthStore()
  const decoded = decodeToken(token)

  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
  const showConfirm = (message, onConfirm) => setConfirmModal({ show: true, message, onConfirm })

  /** 회원 탈퇴 처리 */
  const handleWithdraw = () => {
    showConfirm('정말 탈퇴하시겠습니까? 탈퇴 후에는 복구가 불가능합니다.', async () => {
      const response = await withdrawMember()
      if (response?.status === 200) {
        clearToken()
        showAlert('탈퇴가 완료되었습니다.', () => nav('/'))
      } else {
        showAlert('탈퇴 처리 중 오류가 발생했습니다.')
      }
    })
  }

  /** 프로필 아바타용 이름 첫 글자 */
  const avatarChar = decoded?.memberName?.charAt(0) ?? '회'

  return (
    <div className={styles.container}>

      {/* 로고 */}
      <div className={styles.logo_div} onClick={() => nav('/')}>
        <img src={logo} alt="logo" />
      </div>

      {/* 프로필 */}
      <div className={styles.profile}>
        <div className={styles.avatar}>{avatarChar}</div>
        <div>
          <p className={styles.name}>{decoded?.memberName ?? '회원'}님</p>
          <span className={styles.role}>Member</span>
        </div>
        <div className={styles.bellWrap}>
          <NotificationBell />
        </div>
      </div>

      {/* 메뉴 */}
      <nav className={styles.menu_nav}>
        <div className={styles.section_label}>마이페이지</div>

        <NavLink
          to='.'
          end
          className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}><MdPerson size={18} /></span>
          내 정보 수정
        </NavLink>

        <NavLink
          to='pw'
          className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}><MdLock size={18} /></span>
          비밀번호 변경
        </NavLink>

        <NavLink
          to='orders'
          className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}><MdListAlt size={18} /></span>
          주문 내역
        </NavLink>

        <NavLink
          to='reviews'
          className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}><MdRateReview size={18} /></span>
          리뷰 관리
        </NavLink>
      </nav>

      {/* 하단 */}
      <div className={styles.footer}>
        <div className={styles.menu_item} onClick={() => nav('/')}>
          <span className={styles.icon}><MdHome size={18} /></span>
          메인 사이트
        </div>
        <div className={`${styles.menu_item} ${styles.danger}`} onClick={handleWithdraw}>
          <span className={styles.icon}><MdExitToApp size={18} /></span>
          회원 탈퇴
        </div>
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
