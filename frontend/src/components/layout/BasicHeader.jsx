import styles from './BasicHeader.module.css'
import logo from '../../assets/logo.png'
import { RiSearchLine } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import { decodeToken } from '../../utils/tokenUtils';
import { logoutAPI } from '../../api/member/memberApi';

const BasicHeader = () => {
  const nav = useNavigate();

  const decoded = decodeToken(localStorage.getItem('token'))
  console.log(decoded)


  //로그아웃 함수
  const logout = async () => {
    try{
      await logoutAPI()
    }catch(e){
      console.error('로그아웃 오류', e)
    }finally{
      localStorage.removeItem('token')
      alert('로그아웃 되었습니다')
      nav('/')
    }
  }
  

  return (
    <div>
      <div className={styles.login_div}>
        {decoded ? 
          <div>
            <ul>
              <li style={{cursor : 'default', fontWeight : 'bolder'}}>{decoded.sub}님 반갑습니다.</li>
              <li><Link to='/pw-confirm'>마이페이지</Link></li>
              <li
                onClick={()=>logout()}
              >로그아웃</li>
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
            <li>베스트상품</li>
            <li><Link to='/products'>한우</Link></li>
            <li>세트상품</li>
          </ul>
        </div>
        <div className={styles.search_div}>
          <input 
            type="text" 
            className={styles.search} 
            placeholder='상품 입력'  
          />
          <RiSearchLine/>
        </div>
      </div>
    </div>
  )
}

export default BasicHeader