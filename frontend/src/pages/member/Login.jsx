import { useState } from 'react'
import Form from '../../components/common/Form'
import styles from './Login.module.css'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { goLogin } from '../../api/member/memberApi'
import { Link, useNavigate } from 'react-router-dom'
import { decodeToken } from '../../utils/tokenUtils'

const Login = () => {
  const nav = useNavigate();

  // 자동 로그인 체크박스 state 변수
  const [autoLogin, setAutoLogin] = useState(false)

  const [loginData, setLoginData] = useState({
    memberEmail: '',
    memberPw: ''
  })

  const [errors, setErrors] = useState({
    memberEmail: '이메일을 입력해주세요',
    memberPw: '비밀번호를 입력해주세요'
  })

  // 입력한 값 변경 핸들러
  const handleChange = (field) => (e) => {
    const value = e.target.value

    setLoginData({
      ...loginData,
      [field]: value
    })
    setErrors({
      ...errors,
      [field] : ''
    })
  }

  // 정규식 사용
  const emailRegEx = /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,50}$/

  // 필드별 유효성 검사 함수
  const validateField = (field, value) => {
    switch (field) {
      case 'memberEmail':
        if (!value) return ''
        if (!emailRegEx.test(value)) return '올바른 이메일 형식이 아닙니다'
        return ''
    
      case 'memberPw':
        if (!value) return 'PW를 입력하세요'
        return ''

      default:
        return ''
    }
  }

  

  // 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. newErrors 객체 만들기
    const newErrors = {}

    // 2. memberEmail 비어있으면 newErrors.memberEmail에 메시지 담기
    if (!loginData.memberEmail) {
      newErrors.memberEmail = '이메일을 입력해주세요'
    }

    if (loginData.memberEmail && !emailRegEx.test(loginData.memberEmail)) {
      newErrors.memberEmail = '올바른 이메일 형식이 아닙니다.'
    }

    // 3. memberPw 비어있으면 newErrors.memberPw에 메시지 담기
    if (!loginData.memberPw) {
      newErrors.memberPw = '비밀번호를 입력해주세요'
    }
    
    // 4. newErrors가 비어있지 않으면 setErrors 하고 return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    try{
      const response = await goLogin({...loginData, autoLogin})
      console.log(response)
      if(response.status === 200){
        localStorage.setItem('token', response.headers.authorization)
        alert('로그인 성공')
        // 토큰 복호화하여 저장
        const decoded = decodeToken(response.headers.authorization)
        // 매니저일경우 매니저페이지로 이동
        if(decoded.role === 'ROLE_MANAGER'){
          nav('/manager')
          return;
        }
        // 아닐경우 메인페이지 이동
        nav('/')
      }
    }catch{
      alert('이메일 또는 비밀번호를 확인해주세요.')
    }
  }
  
  return (
    <div data-theme='light'>
      <Form title='로그인' onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <Input 
          label='Email'
          type='email'
          name='memberEmail'
          placeholder='Input Your ID'
          value={loginData.memberEmail}
          onChange={handleChange('memberEmail')}
          error={errors.memberEmail}
          required
        />
        {/* Password */}
        <Input 
          label='Password'
          type='password'
          name='memberPw'
          placeholder='Input Your Password'
          value={loginData.memberPw}
          onChange={handleChange('memberPw')}
          error={errors.memberPw}
          required
        />
        <div className={styles.chkbox_div}>
          <input 
            type='checkbox' 
            id='autoLogin'
            checked={autoLogin}
            onChange={e => setAutoLogin(e.target.checked)}
          />
          <label htmlFor='autoLogin'>자동 로그인</label>
        </div>
        {/* Submit Button */}
        <div>
          <Button
            variant='dark'
            fullWidth={true}
            type='submit'
          >
            로그인
          </Button>
        </div>
        <div className={styles.findLink}>
          <Link to='/find-account?tab=id'>아이디 찾기</Link>
          <span className={styles.divider}>|</span>
          <Link to='/find-account?tab=pw'>비밀번호 찾기</Link>
        </div>
      </Form>
    </div>
  )
}

export default Login