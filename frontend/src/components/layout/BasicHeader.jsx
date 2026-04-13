import styles from './BasicHeader.module.css'
import logo from '../../assets/logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { decodeToken } from '../../utils/tokenUtils';
import { logoutAPI } from '../../api/member/memberApi';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../common/NotificationBell';
import { MdAdminPanelSettings, MdLogin, MdLogout, MdPerson, MdPersonAdd, MdSearch, MdShoppingCart, MdHistory } from 'react-icons/md';
import { getRecommendedKeywords } from '../../api/product/product';

const BasicHeader = () => {
  const nav = useNavigate();
  const { showAlert } = useAuthStore()

  // store에서 token 가져오기
  // token이 바뀌면 이 컴포넌트가 자동으로 리렌더링됨
  const { token, clearToken } = useAuthStore()

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
  const [showDrop, setShowDrop] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]')
  })
  const [recommended, setRecommended] = useState([])

  useEffect(()=>{
    getRecommendedKeywords().then(res => setRecommended(res.data))
  }, [])

  const searchRef = useRef(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색 실행 (최근 검색어 저장 포함)
  const handleSearch = (value = keyword) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const updated = [trimmed, ...recentSearches.filter(k => k !== trimmed)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    setShowDrop(false)
    setKeyword(trimmed)
    nav(`/products?keyword=${trimmed}`)
  }

  // 최근 검색어 개별 삭제
  const deleteRecent = (e, word) => {
    e.stopPropagation()
    const updated = recentSearches.filter(k => k !== word)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // 최근 검색어 전체 삭제
  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
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
                <MdShoppingCart size={22} />
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
        <div className={styles.search_div} ref={searchRef}>
          <input
            type="text"
            className={styles.search}
            placeholder='상품 입력'
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onFocus={() => setShowDrop(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <MdSearch onClick={() => handleSearch()} />

          {showDrop && (
            <div className={styles.search_drop}>

              {/* 최근 검색어 */}
              {recentSearches.length > 0 && (
                <>
                  {recentSearches.map(word => (
                    <div key={word} className={styles.drop_item} onClick={() => handleSearch(word)}>
                      <MdHistory size={16} className={styles.drop_icon} />
                      <span className={styles.drop_word}>{word}</span>
                      <button className={styles.delete_btn} onClick={(e) => deleteRecent(e, word)}>✕</button>
                    </div>
                  ))}
                  <div className={styles.drop_divider} />
                </>
              )}

              {/* 추천 검색어 */}
              <div className={styles.drop_recommend}>
                <span className={styles.drop_title}>추천 검색어</span>
                <div className={styles.recommend_wrap}>
                  {recommended.map(word => (
                    <button key={word} className={styles.recommend_btn} onClick={() => handleSearch(word)}>
                      {word}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default BasicHeader