import MemberMenu from './MemberMenu'
import { Outlet } from 'react-router-dom'
import styles from './MemberLayout.module.css'
import useAuthStore from '../../store/authStore'

/**
 * 일반 회원 마이페이지 레이아웃
 * - 좌측 고정 사이드바 + 우측 콘텐츠 구조 (ManagerLayout 동일 형식)
 */
const MemberLayout = () => {
  const { isAuthReady } = useAuthStore()

  if (!isAuthReady) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#aaa', fontSize: '14px' }}>
      로딩 중...
    </div>
  )

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
