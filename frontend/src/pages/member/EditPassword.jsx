import React, { useState } from 'react'
import Form from '../../components/common/Form'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { decodeToken } from '../../utils/tokenUtils'
import { setPw } from '../../api/member/memberApi'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import styles from './EditPassword.module.css'

/**
 * 비밀번호 변경 페이지
 */
const EditPassword = () => {
  const nav = useNavigate()
  const { token, showAlert } = useAuthStore()
  const decoded = decodeToken(token)

  const [newPw, setNewPw] = useState({ memberPw: '', memberPwCheck: '' })
  const [errors, setErrors] = useState({ memberPw: '', memberPwCheck: '' })

  /** 필드별 유효성 검사 */
  const validateField = (field, value) => {
    let error = ''
    if (field === 'memberPw') {
      if (!value) error = '비밀번호를 입력해주세요'
      else if (value.length < 8) error = '8자 이상 입력해주세요'
    }
    if (field === 'memberPwCheck') {
      if (!value) error = '비밀번호 확인을 입력해주세요'
      else if (value !== newPw.memberPw) error = '비밀번호가 일치하지 않습니다'
    }
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  /** 입력값 변경 핸들러 */
  const handleChange = (field) => (e) => {
    const value = e.target.value
    setNewPw(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
    if (field === 'memberPw' && newPw.memberPwCheck) {
      validateField('memberPwCheck', newPw.memberPwCheck)
    }
  }

  /** 제출 핸들러 */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const checks = {
      memberPw:      !newPw.memberPw           ? '비밀번호를 입력해주세요'      :
                     newPw.memberPw.length < 8 ? '8자 이상 입력해주세요'        : '',
      memberPwCheck: !newPw.memberPwCheck                          ? '비밀번호 확인을 입력해주세요'  :
                     newPw.memberPw !== newPw.memberPwCheck         ? '비밀번호가 일치하지 않습니다' : '',
    }
    setErrors(checks)
    if (Object.values(checks).some(msg => msg !== '')) {
      showAlert('입력 항목을 다시 확인해주세요.')
      return
    }
    const response = await setPw({ memberEmail: decoded.sub, memberPw: newPw.memberPw })
    if (response.status === 200) showAlert('비밀번호 수정이 완료되었습니다.', () => nav(-1))
    else showAlert('수정 실패')
  }

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>비밀번호 변경</h2>
        <p className={styles.pageSubtitle}>새로운 비밀번호를 입력해주세요. (8자 이상)</p>
      </div>

      {/* 폼 카드 */}
      <div className={styles.card}>
        <form 
          onSubmit={handleSubmit} 
          noValidate 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          <Input 
            label='새로운 비밀번호' 
            type='password' 
            name='memberPw' 
            placeholder='새로운 비밀번호 입력' 
            value={newPw.memberPw} 
            onChange={handleChange('memberPw')} 
            error={errors.memberPw} required 
          />
          <Input 
            label='새로운 비밀번호 확인' 
            type='password' 
            name='memberPwCheck' 
            placeholder='새로운 비밀번호 확인' 
            value={newPw.memberPwCheck} 
            onChange={handleChange('memberPwCheck')} 
            error={errors.memberPwCheck} 
            required 
          />
          <Button type='submit' fullWidth>수정 완료</Button>
        </form>
      </div>
    </div>
  )
}

export default EditPassword
