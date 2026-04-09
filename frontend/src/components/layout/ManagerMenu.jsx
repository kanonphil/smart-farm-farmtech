import { NavLink, useNavigate } from 'react-router-dom'
import styles from './ManagerMenu.module.css'
import logo from '../../assets/logo-dark.png'
import { useState } from 'react'
import {
  MdDashboard, MdAddBox, MdInventory, MdListAlt,
  MdMemory, MdTune, MdNotifications, MdHome,
  MdExpandLess, MdExpandMore
} from 'react-icons/md'

const ManagerMenu = () => {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState('상품') // 기본으로 열려있는 섹션

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section)
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
          <span className={styles.role}>Admin</span>
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
          <MdDashboard size={18} /> 대시보드
        </NavLink>

        {/* 상품 섹션 */}
        <div className={styles.section_label} onClick={() => toggleSection('상품')}>
          <span>상품</span>
          {openSection === '상품' ? <MdExpandLess size={16}/> : <MdExpandMore size={16}/>}
        </div>
        <div className={`${styles.section_items} ${openSection === '상품' ? styles.open : ''}`}>
          <NavLink
            to='reg-product'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdAddBox size={18} /> 상품 등록
          </NavLink>
          <NavLink
            to='stock'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdInventory size={18} /> 재고 관리
          </NavLink>
          <NavLink
            to='orders'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdListAlt size={18} /> 주문 관리
          </NavLink>
        </div>

        {/* 스마트팜 섹션 */}
        <div className={styles.section_label} onClick={() => toggleSection('스마트팜')}>
          <span>스마트팜</span>
          {openSection === '스마트팜' ? <MdExpandLess size={16}/> : <MdExpandMore size={16}/>}
        </div>
        <div className={`${styles.section_items} ${openSection === '스마트팜' ? styles.open : ''}`}>
          <NavLink
            to='actuator'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdMemory size={18} /> 액츄에이터 제어
          </NavLink>
          <NavLink
            to='threshold'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdTune size={18} /> 임계값 설정
          </NavLink>
          <NavLink
            to='alerts'
            className={({ isActive }) => `${styles.menu_item} ${isActive ? styles.active : ''}`}
          >
            <MdNotifications size={18} /> 알림 이력
          </NavLink>
        </div>

      </nav>

      {/* 하단 */}
      <div className={styles.footer}>
        <div className={styles.menu_item} onClick={() => navigate('/')}>
          <MdHome size={18} /> 메인 사이트
        </div>
      </div>

    </div>
  )
}

export default ManagerMenu
