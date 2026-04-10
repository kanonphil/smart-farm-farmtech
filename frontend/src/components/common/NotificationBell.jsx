import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotification from '../../hooks/useNotification'
import styles from './NotificationBell.module.css'
import { TbBell, TbBellRinging, TbBellOff } from 'react-icons/tb'

/**
 * 헤더 알림 벨 컴포넌트
 * - 안 읽은 알림 수 뱃지 표시 (pulse 애니메이션)
 * - 클릭 시 드롭다운으로 알림 목록 표시 (fade + slide-down)
 * - 알림 클릭 시 읽음 처리 후 해당 경로로 이동
 * - 알림 없을 시 TbBellOff 아이콘 + 안내 문구 표시
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

      {/* 벨 버튼 */}
      <button className={styles.bell} onClick={() => setOpen(prev => !prev)}>
        {unreadCount > 0 ? (
          <TbBellRinging size={22} className={styles.ringing} />
        ) : (
          <TbBell size={22} />
        )}
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className={styles.dropdown}>

          {/* 헤더 */}
          <div className={styles.dropdownHeader}>
            <TbBell size={16} />
            <span>알림</span>
            {unreadCount > 0 && (
              <span className={styles.headerBadge}>{unreadCount}개 미읽음</span>
            )}
          </div>

          {/* 알림 목록 */}
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <TbBellOff size={32} className={styles.emptyIcon} />
              <p>새 알림이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map(n => (
                <div
                  key={n.notificationId}
                  className={styles.item}
                  onClick={() => handleClickNotification(n)}
                >
                  <div className={styles.itemDot} />
                  <div className={styles.itemContent}>
                    <p className={styles.message}>{n.message}</p>
                    <span className={styles.time}>
                      {n.createdAt?.replace('T', ' ').slice(0, 16)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
