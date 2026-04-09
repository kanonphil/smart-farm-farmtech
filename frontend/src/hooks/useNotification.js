import { useEffect, useState } from "react"
import useAuthStore from "../store/authStore"
import { connectNotificationStream, getUnreadNotifications, markNotificationAsRead } from "../api/notificationApi"

/**
 * 알림 커스텀 훅
 * - 로그인 상태일 때만 SSE 연결
 * - 페이지 첫 진입 시 오프라인 동안 쌓인 알림 복원
 * - 로그아웃 시 SSE 연결 자동 해제
 */
const useNotification = () => {
  const { token } = useAuthStore()
  const [notifications, setNotifications] = useState([])

  // 첫 진입 시 밀린 알림 복원
  useEffect(() => {
    if (!token) {
      setNotifications([])
      return
    }
    getUnreadNotifications()
      .then(setNotifications)
      .catch(err => console.error('[알림] 조회 실패', err))
  }, [token])

  // SSE 연결 (로그인 상태일 때만)
  useEffect(() => {
    if (!token) return

    const disconnect = connectNotificationStream((newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
    })

    // 로그아웃 또는 컴포넌트 언마운트 시 연결 해제
    return disconnect
  }, [token])

  /**
   * 알림 읽음 처리
   * - 서버에 읽음 상태 반영 후 목록에서 제거
   */
  const readNotification = async (notificationId) => {
    await markNotificationAsRead(notificationId)
    setNotifications(prev => prev.filter(n => n.notificationId !== notificationId))
  }
  
  return {
    notifications,
    unreadCount: notifications.length,
    readNotification,
  }
}

export default useNotification