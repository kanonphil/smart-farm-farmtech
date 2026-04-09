import { axiosInstance } from './axiosInstance'
import useAuthStore from '../store/authStore'

/**
 * SSE 알림 스트림 연결
 * EventSource는 커스텀 헤더를 지원하지 않아 토큰을 쿼리 파라미터로 전달
 * @param {function} onNotification - 알림 수신 시 콜백
 * @returns {function} - 연결 해제 함수
 */
export const connectNotificationStream = (onNotification) => {
  const token = useAuthStore.getState().token
  const eventSource = new EventSource(
    `http://localhost:8080/notifications/stream?token=${encodeURIComponent(token)}`
  )

  eventSource.addEventListener('notification', (e) => {
    onNotification(JSON.parse(e.data))
  })

  eventSource.onerror = () => {
    console.warn('[SSE] 연결 오류 - 브라우저가 자동 재연결 시도')
  }

  return () => eventSource.close()
}

/** 안 읽은 알림 목록 조회 */
export const getUnreadNotifications = async () => {
  const response = await axiosInstance.get('/notifications/unread')
  return response.data
}

/** 읽음 처리 */
export const markNotificationAsRead = async (notificationId) => {
  await axiosInstance.patch(`/notifications/${notificationId}/read`)
}
