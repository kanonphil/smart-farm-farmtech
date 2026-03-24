import { useState } from 'react'
import Form from '../../components/common/Form'
import styles from './Login.module.css'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const Login = () => {
  const [loginData, setLoginData] = useState({
    memEmail: '',
    memPw: ''
  })

  const [errors, setErrors] = useState({
    memEmail: '이메일을 입력해주세요',
    memPw: '비밀번호를 입력해주세요'
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

  // 로그인 처리
  const handleSubmit = (e) => {
    e.preventDefault()

    // 1. newErrors 객체 만들기
    const newErrors = {}

    // 2. memEmail 비어있으면 newErrors.memEmail에 메시지 담기
    if (!loginData.memEmail) {
      newErrors.memEmail = '이메일을 입력해주세요'
    }

    if (loginData.memEmail && !emailRegEx.test(loginData.memEmail)) {
      newErrors.memEmail = '올바른 이메일 형식이 아닙니다.'
    }

    // 3. memPw 비어있으면 newErrors.memPw에 메시지 담기
    if (!loginData.memPw) {
      newErrors.memPw = '비밀번호를 입력해주세요'
    }
    
    // 4. newErrors가 비어있지 않으면 setErrors 하고 return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('로그인 데이터:', loginData);
    
  }
  
  return (
    <Form title='로그인' onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <Input 
        label='Email'
        type='email'
        name='memEmail'
        placeholder='Input Your ID'
        value={loginData.memEmail}
        onChange={handleChange('memEmail')}
        error={errors.memEmail}
        required
      />
      {/* Password */}
      <Input 
        label='Password'
        type='password'
        name='memPw'
        placeholder='Input Your Password'
        value={loginData.memPw}
        onChange={handleChange('memPw')}
        error={errors.memPw}
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