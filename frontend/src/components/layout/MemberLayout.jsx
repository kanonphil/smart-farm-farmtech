import MemberMenu from './MemberMenu'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './MemberLayout.module.css'
import useAuthStore from '../../store/authStore'
import { useEffect } from 'react'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * 일반 회원 마이페이지 레이아웃
 * - 좌측 고정 사이드바 + 우측 콘텐츠 구조 (ManagerLayout 동일 형식)
 */
const MemberLayout = () => {
  const { token, isAuthReady } = useAuthStore()
  const nav = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthReady) return

    // 비로그인 -> 로그인 페이지 (로그인 후 원래 페이지로 돌아오기 위해 from 저장)
    if (!token) {
      nav('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthReady, token])

  if (!isAuthReady) return <LoadingSpinner />

  return (
    <div className={styles.container}>
      {/* 사이드바 메뉴 */}
      <div className={styles.menu}>
        <MemberMenu />
      </div>
      {/* 콘텐츠 영역 */}
      <div className={styles.pages}>
        <Outlet />
      </div>
    </div>
  )
}

export default MemberLayout
