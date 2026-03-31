import { Outlet } from 'react-router-dom'
import styles from './ManagerLayout.module.css'
import ManagerMenu from './ManagerMenu'

const ManagerLayout = () => {
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