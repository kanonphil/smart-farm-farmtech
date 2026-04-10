import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import styles from './ManagerMenu.module.css'
import logo from '../../assets/logo-dark.png'
import { useState } from 'react'
import {
  MdDashboard, MdAddBox, MdInventory, MdListAlt,
  MdMemory, MdHome, MdExpandLess, MdExpandMore,
  MdShowChart
} from 'react-icons/md'

const ManagerMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()

  /** 현재 경로에 따라 열려야 할 섹션 초기값 결정 */
  const getInitialSections = () => {
    const path = location.pathname
    const set = new Set()
    if (path.includes('products') || path.includes('stock') || path.includes('orders')) {
      set.add('상품')
    }
    if (path.includes('sensor-chart') || path.includes('actuator')) {
      set.add('스마트팜')
    }
    // 어디에도 해당 없으면 상품 기본 오픈
    if (set.size === 0) set.add('상품')
    return set
  }

  const [openSections, setOpenSections] = useState(() => getInitialSections())

  const toggleSection = (section) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  return (
    <div className={styles.container}>

      {/* 로고 */}
      <div className={styles.logo_div} onClick={() => navigate('/')}>
        <img src={logo} alt="logo" />
      </div>

      {/* 프로필 */}
      <div className={styles.profile}>
        <div className={styles.avatar}>관</div>
        <div>
          <p className={styles.name}>관리자</p>
          <span className={styles.role}>Manager</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className={styles.menu_nav}>

        {/* 메인 */}
        <div className={styles.section_label_static}>메인</div>
        <NavLink
          to=''
          end
          className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}><MdDashboard size={18} /></span> 대시보드
        </NavLink>

        {/* 상품 섹션 */}
        <div className={styles.section_label} onClick={() => toggleSection('상품')}>
          <span>상품</span>
          {openSections.has('상품') ? <MdExpandLess size={16}/> : <MdExpandMore size={16}/>}
        </div>
        <div className={`${styles.section_items} ${openSections.has('상품') ? styles.open : ''}`}>
          <NavLink
            to='products'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}><MdAddBox size={18} /></span> 상품 관리
          </NavLink>
          <NavLink
            to='stock'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}><MdInventory size={18} /></span> 재고 관리
          </NavLink>
          <NavLink
            to='orders'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}><MdListAlt size={18} /></span> 주문 관리
          </NavLink>
        </div>

        {/* 스마트팜 섹션 */}
        <div className={styles.section_label} onClick={() => toggleSection('스마트팜')}>
          <span>스마트팜</span>
          {openSections.has('스마트팜') ? <MdExpandLess size={16}/> : <MdExpandMore size={16}/>}
        </div>
        <div className={`${styles.section_items} ${openSections.has('스마트팜') ? styles.open : ''}`}>
          <NavLink
            to='sensor-chart'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}><MdShowChart size={18} /></span> 데이터 분석
          </NavLink>
          <NavLink
            to='actuator'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}><MdMemory size={18} /></span> 기기 제어
          </NavLink>
        </div>

      </nav>

      {/* 하단 */}
      <div className={styles.footer}>
        <div className={styles.menu_item} onClick={() => navigate('/')}>
          <span className={styles.icon}><MdHome size={18} /></span> 메인 사이트
        </div>
      </div>

    </div>
  )
}

export default ManagerMenu
