import styles from './BasicHeader.module.css'
import logo from '../../assets/logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { decodeToken } from '../../utils/tokenUtils';
import { logoutAPI } from '../../api/member/memberApi';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../common/NotificationBell';
import { MdAdminPanelSettings, MdLogin, MdLogout, MdPerson, MdPersonAdd, MdSearch, MdShoppingCart } from 'react-icons/md';

const BasicHeader = () => {
  const nav = useNavigate();
  const { showAlert } = useAuthStore()

  // store에서 token 가져오기
  // token이 바뀌면 이 컴포넌트가 자동으로 리렌더링됨
  const { token, clearToken, cartCount } = useAuthStore()

  const decoded = decodeToken(token)

  //로그아웃 함수
  const logout = async () => {
    try{
      await logoutAPI()
    }catch(e){
      console.error('로그아웃 오류', e)
    }finally{
      //store에서 토큰 삭제
      clearToken()
      showAlert('로그아웃 되었습니다.')
      nav('/')
    }
  }
  
  //검색 내용 저장 state변수
  const [keyword, setKeyword] = useState('')

  //검색창 함수
  const handleSearch = () => {
    nav(`/products?keyword=${keyword.trim()}`)
  }
  
  console.log(decoded?.memberName)
  return (
    <div>
      <div className={styles.login_div}>
        {decoded ? 
          <ul>
            <li className={styles.greeting}>{decoded.memberName}님 반갑습니다.</li>
            <li><NotificationBell /></li>
            <li>
              <Link to='/cart' className={styles.utilLink} data-tooltip='장바구니'>
                <div className={styles.cartWrap}>
                  <MdShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className={styles.cartBadge}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
            <li>
              <Link to='/pw-confirm' className={styles.utilLink} data-tooltip='마이페이지'>
                <MdPerson size={22} />
              </Link>
            </li>
            <li>
              <span className={styles.utilLink} onClick={logout} data-tooltip='로그아웃'>
                <MdLogout size={22} />
              </span>
            </li>
            {decoded?.role === 'ROLE_MANAGER' && (
              <li>
                <Link to='/manager' className={styles.adminLink}data-tooltip='관리자 페이지'>
                  <MdAdminPanelSettings size={22} />
                </Link>
              </li>
            )}
          </ul>
        :
          <ul>
            <li>
              <Link to='/login' className={styles.utilLink}data-tooltip='로그인'>
                <MdLogin size={22} />
              </Link>
            </li>
            <li>
              <Link to='/join' className={styles.utilLink}data-tooltip='회원가입'>
                <MdPersonAdd size={22} />
              </Link>
            </li>
          </ul>
        }
      </div>
      <div className={styles.logo_div}>
        <img src={logo} onClick={e => nav('/')}/>
      </div>
      <div className={styles.menu}>
        <div>
          <ul>
            <Link to='/about'><li>한우마루 소개</li></Link>
            <li>공지사항</li>
            <Link to='/ai-chef'><li>AI셰프</li></Link>
            <Link to='/products'><li>한우</li></Link>
            <Link to='/user-reviews'><li>고객리뷰</li></Link>
          </ul>
        </div>
        <div className={styles.search_div}>
          <input 
            type="text" 
            className={styles.search} 
            placeholder='상품 입력'
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <MdSearch onClick={handleSearch}/>
        </div>
      </div>
    </div>
  )
}

export default BasicHeader