import useAuthStore from '../store/authStore'
import { markNotificationAsRead } from '../api/notificationApi'

/**
 * 알림 커스텀 훅
 * - 알림 상태는 authStore에서 전역 관리
 * - SSE 연결은 App.jsx에서 token 기준으로 유지
 */
const useNotification = () => {
  const { notifications, removeNotification } = useAuthStore()

  /** 알림 읽음 처리 - 서버 반영 후 전역 상태에서 제거 */
  const readNotification = async (notificationId) => {
    await markNotificationAsRead(notificationId)
    removeNotification(notificationId)
  }

  return {
    notifications,
    unreadCount: notifications.length,
    readNotification,
  }
}

export default useNotification
