import React, { useState } from 'react'
import Form from '../../components/common/Form'
import Input from '../../components/common/Input'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { decodeToken } from '../../utils/tokenUtils'
import { setPw } from '../../api/member/memberApi'
import useAuthStore from '../../store/authStore'


const EditPassword = () => {
  const nav = useNavigate();
  const { token, showAlert } = useAuthStore()
  const decoded = decodeToken(token)

  // 새로운 비밀번호 저장 state변수
  const [newPw, setNewPw] = useState({
    memberPw : '',
    memberPwCheck : ''
  })

  // 에러메시지 저장 state변수
  const [errors, setErrors] = useState({
    memberPw : '',
    memberPwCheck : ''
  })

  const [isValid, setIsValid] = useState({
    memPw: false, memPwCheck: false
  })

  //필드 유효성 검사
  const validateField = (field, value) => {
    let error = ''
    if (field === 'memberPw') {
      if (value === '') error = '비밀번호를 입력해주세요'
      else if (value.length < 8) error = '8자 이상 입력해주세요'
    }
    if (field === 'memberPwCheck') {
      if (value === '') error = '비밀번호 확인을 입력해주세요'
      else if (value !== newPw.memberPw) error = '비밀번호가 일치하지 않습니다'
    }
    setErrors(prev => ({ ...prev, [field]: error}))
  }

  //입력값 변경 핸들러
  const handleChange = (field) => (e) => {
    const value = e.target.value
    const newForm = {...newPw, [field]:value}
    setNewPw(newForm)
    validateField(field, value, newForm)
    // 비밀번호 변경 시 비밀번호 확인 재검증
    if (field === 'memberPw' && newPw.memberPwCheck) {
      validateField('memberPwCheck', newPw.memberPwCheck, newForm)
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    const checks = {
      memberPw:      newPw.memberPw === ''                                     ? '비밀번호를 입력해주세요'        :
                  newPw.memberPw.length < 8                                 ? '8자 이상 입력해주세요'          : '',
      memberPwCheck: newPw.memberPwCheck === ''                                ? '비밀번호 확인을 입력해주세요'   :
                  newPw.memberPw !== newPw.memberPwCheck                        ? '비밀번호가 일치하지 않습니다'   : ''
    }
    setErrors(checks)
    setIsValid({
      memPw:      checks.memberPw      === '',
      memPwCheck: checks.memberPwCheck === ''
    })
    if (Object.values(checks).some(msg => msg !== '')) {
      showAlert("입력 항목을 다시 확인해주세요.")
      return;
    }
    const data = {
      memberEmail : decoded.sub,
      memberPw : newPw.memberPw
    }
    const response = await setPw(data)
    if(response.status === 200){
      showAlert('비밀번호 수정이 완료되었습니다.', () => nav(-1))
    }
    else{
      showAlert('수정 실패')
    }
  }

  return (
    <div data-theme ='light'>
      <Form title='비밀번호 변경' onSubmit={handleSubmit} noValidate>
        <Input
          label='새로운 비밀번호'
          type='password'
          name='memberPw'
          placeholder='새로운 비밀번호 입력'
          value={newPw.memberPw}
          onChange={handleChange('memberPw')}
          error={errors.memberPw}
          required
        />
        <Input
          label='새로운 비밀번호 확인'
          type='password'
          name ='memberPwCheck'
          placeholder='새로운 비밀번호 확인'
          value={newPw.memberPwCheck}
          onChange={handleChange('memberPwCheck')}
          error={errors.memberPwCheck}
          required
        />
        <Button 
          type='submit' 
          fullWidth
        >
          수정 완료
        </Button>
      </Form>
    </div>
  )
}

export default EditPassword