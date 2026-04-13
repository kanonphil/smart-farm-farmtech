import { useLocation, useNavigate } from "react-router-dom"
import useAuthStore from "../../store/authStore"
import { useEffect } from "react"
import LoadingSpinner from "./LoadingSpinner"

/**
 * 로그인이 필요한 페이지를 감싸는 인증 가드 컴포넌트
 * 비로그인 상태면 로그인 페이지로 리다이렉트, 로그인 후 원래 경로로 복귀
 */
const RequireAuth = ({ children }) => {
  const { token, isAuthReady } = useAuthStore()
  const nav = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthReady) return
    // 비로그인 → 로그인 페이지 (로그인 후 원래 페이지로 돌아오기 위해 from 저장)
    if (!token) nav('/login', { replace: true, state: { from: location.pathname } })
  }, [isAuthReady, token])

  if (!isAuthReady) return <LoadingSpinner />
  return children
}

export default RequireAuth