import { Outlet, useNavigate } from 'react-router-dom'
import styles from './ManagerLayout.module.css'
import ManagerMenu from './ManagerMenu'
import useAuthStore from '../../store/authStore'
import { useEffect } from 'react'
import { decodeToken } from '../../utils/tokenUtils'
import LoadingSpinner from '../common/LoadingSpinner'

const ManagerLayout = () => {
  const { token, isAuthReady, showToast } = useAuthStore()
  const nav = useNavigate()

  useEffect(() => {
    // 앱 초기 토큰 복구가 끝날 때까지 대기
    if (!isAuthReady) return

    // 비로그인 -> 로그인 페이지
    if (!token) {
      nav('/login', { replace: true })
      return
    }

    // 로그인은 됐지만 매니저 권한 없음 -> 홈으로
    const decoded = decodeToken(token)
    if (decoded?.role !== 'ROLE_MANAGER') {
      showToast('접근 권한이 없습니다.')
      nav('/', { replace: true })
    }
  }, [isAuthReady, token])

  // 토큰 복구 전엔 아무것도 렌더링하지 않음
  if (!isAuthReady) return <LoadingSpinner />
  
  return (
    // 사이드바 + 콘텐츠
    <div className={styles.container}>
      {/* 사이드바 메뉴 */}
      <div className={styles.menu}>
        <ManagerMenu />
      </div>

      {/* 콘텐츠 영역 */}
      <div className={styles.pages}>
        <Outlet />
      </div>
    </div>
  )
}

export default ManagerLayout