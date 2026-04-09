import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotification from '../../hooks/useNotification'
import styles from './NotificationBell.module.css'
import { TbBell, TbBellRinging } from 'react-icons/tb'

/**
 * 헤더 알림 벨 컴포넌트
 * - 안 읽은 알림 수 뱃지 표시
 * - 클릭 시 드롭다운으로 알림 목록 표시
 * - 알림 클릭 시 읽음 처리 후 해당 경로로 이동
 */
const NotificationBell = () => {
  const nav = useNavigate()
  const { notifications, unreadCount, readNotification } = useNotification()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClickNotification = async (notification) => {
    await readNotification(notification.notificationId)
    setOpen(false)
    nav(notification.link)
  }

  return (
    <div className={styles.wrap} ref={dropdownRef}>
      {/* 벨 아이콘 + 뱃지 */}
      <button className={styles.bell} onClick={() => setOpen(prev => !prev)}>
        {unreadCount > 0 ? (
          <TbBellRinging size={20} className={styles.ringing} />
        ) : (
          <TbBell size={20} />
        )}
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownTitle}>알림</p>
          {notifications.length === 0 ? (
            <p className={styles.empty}>새 알림이 없습니다.</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.notificationId}
                className={styles.item}
                onClick={() => handleClickNotification(n)}
              >
                <p className={styles.message}>{n.message}</p>
                <span className={styles.time}>
                  {n.createdAt?.replace('T', ' ').slice(0, 16)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
