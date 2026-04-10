import styles from './BasicHeader.module.css'
import logo from '../../assets/logo.png'
import { RiSearchLine } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import { decodeToken } from '../../utils/tokenUtils';
import { logoutAPI } from '../../api/member/memberApi';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../common/NotificationBell';

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

  //검색창 함수
  const handleSearch = () => {
    nav(`/products?keyword=${keyword.trim()}`)
  }
  

  return (
    <div>
      <div className={styles.login_div}>
        {decoded ? 
          <div>
            <ul>
              <li style={{cursor : 'default', fontWeight : 'bolder'}}>{decoded.sub}님 반갑습니다.</li>
              <li><NotificationBell /></li>
              <li><Link to='/cart'>장바구니</Link></li>
              <li><Link to='/pw-confirm'>마이페이지</Link></li>
              
              <li
                onClick={()=>logout()}
              >로그아웃</li>
              {
                decoded?.role === 'ROLE_MANAGER' && <Link to='/manager'><li style={{color : 'red', fontWeight : 'bolder'}}>관리자페이지</li></Link>
              }
            </ul>
          </div>
        :
          <div>
            <ul>
              <li><Link to='/login'>로그인</Link></li>
              <li><Link to='/join'>회원가입</Link></li>
            </ul>
          </div>
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
          <RiSearchLine onClick={handleSearch}/>
        </div>
      </div>
    </div>
  )
}

export default BasicHeader