import React, { useState } from 'react'
import styles from './PasswordConfirm.module.css'
import Form from '../../components/common/Form'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useNavigate } from 'react-router-dom'
import { confirmPw } from '../../api/member/memberApi'
import { decodeToken } from '../../utils/tokenUtils'
import useAuthStore from '../../store/authStore'


const PasswordConfirm = () => {
  const nav = useNavigate();
  
  const { token } = useAuthStore()
  const decoded = decodeToken(token)


  // 입력받은 패스워드 저장 state 변수
  const [pwData, setPwData] = useState({
    memberPw: ''
  })

  //에러 텍스트 저장 state 변수
  const [errors, setErrors] = useState({
    memberPw: '비밀번호를 입력해주세요'
  })

  //입력한 값 변경 핸들러
  const handleChange = e => {
    setPwData({
      memberPw : e.target.value
    })
    setErrors({
      memberPw : ''
    })
  }

  //비밀번호가 일치한경우
  const handleSubmit = async (e) => {
    e.preventDefault()

    const loginData = {
      memberEmail : decoded.sub,
      memberPw : pwData.memberPw
    }
    console.log(loginData)
    try{
      const response = await confirmPw(loginData)
      if(response.data === true){
        nav('/mypage')
      }
      else{
        alert('비밀번호를 확인해주세요.')  
      }
    }catch(e){
      alert('비밀번호를 확인해주세요.')
    }
  }
  
  return (
    <div data-theme='light'>
      <Form title='비밀번호 확인' onSubmit={handleSubmit} noValidate>
        <Input
          label='Password'
          type='password'
          name='memberPw'
          placeholder='Input Your Password'
          value={pwData.memberPw}
          onChange={e => handleChange(e)}
          error={errors.memberPw}
          required
        />
        <div>
          <Button
            variant='dark'
            fullWidth={true}
            type='submit'
          >
            확인
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default PasswordConfirm