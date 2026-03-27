import { useState } from 'react'
import Form from '../../components/common/Form'
import styles from './Login.module.css'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { goLogin } from '../../api/member/memberApi'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const nav = useNavigate();
  
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

    const response = await goLogin(loginData)

    if(response.status === 200){
      console.log(response)

      localStorage.setItem('token', response.headers.authorization)

      alert('로그인 성공')

      nav('/')
    }
    else{
      alert('로그인 실패')
    }
  }
  
  return (
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
    </Form>
  )
}

export default Login