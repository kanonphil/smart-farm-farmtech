import { NavLink, useNavigate } from 'react-router-dom'
import styles from './ManagerMenu.module.css'
import logo from '../../assets/logo.png'

const ManagerMenu = () => {
  const navigate = useNavigate()
  
  return (
    <div className={styles.container}>
      {/* 로고 클릭 시 메인 페이지로 이동 */}
      <div className={styles.logo_div}>
        <img src={logo} alt={() => navigate('/')} />
      </div>

      {/* 관리자 타이틀 */}
      <div className={styles.profile}>
        <p className={styles.name}>관리자</p>
        <p className={styles.welcome}>스마트팜 관리 시스템</p>
      </div>

      {/* 관리자 메뉴 목록 */}
      {/* NavLink: 현재 경로와 일치하면 isActive가 true -> active 스타일 적용 */}
      <ul className={styles.menu_list}>
        <li>
          <NavLink
            to='dashboard'
            className={(param) => param.isActive ? styles.active : ''}
          >
            대시보드
          </NavLink>
        </li>
        <li>
          <NavLink
            to='reg-product'
            className={(param) => param.isActive ? styles.active : ''}
          >
            상품 등록
          </NavLink>
        </li>
        <li>
          <NavLink
            to='stock'
            className={(param) => param.isActive ? styles.active : ''}
          >
            재고 관리
          </NavLink>
        </li>
        <li>
          <NavLink
            to='actuator'
            className={(param) => param.isActive ? styles.active : ''}
          >
            액츄에이터 제어
          </NavLink>
        </li>
        <li>
          <NavLink
            to='threshold'
            className={(param) => param.isActive ? styles.active : ''}
          >
            임계값 설정
          </NavLink>
        </li>
        <li>
          <NavLink
            to='alerts'
            className={(param) => param.isActive ? styles.active : ''}
          >
            알림 이력
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default ManagerMenu