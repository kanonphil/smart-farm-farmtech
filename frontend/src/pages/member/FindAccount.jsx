import React, { useState } from 'react'
import styles from './FindAccount.module.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { findEmail, resetPw, verifyAccount } from '../../api/member/memberApi'
import Form from '../../components/common/Form'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import useAuthStore from '../../store/authStore'

const FindAccount = () => {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'id'
  const { showAlert } = useAuthStore()

  // ── 탭 전환 handle ──
  const handleTabChange = (newTab) => {
    setSearchParams({tab: newTab})
    setFoundEmail(null)
    setStep(1)
  }

  // ── 아이디 찾기 state ── 
  const [idForm, setIdForm] = useState({
    memberName: '',
    memberPhone: ''
  })
  const [foundEmail, setFoundEmail] = useState(null)

  // ── 비밀번호 찾기 state ──
  const [step, setStep] = useState(1)
  const [pwForm, setPwForm] = useState({
    memberEmail: '',
    memberName: '',
    memberPhone: ''
  })
  const [newPwForm, setNewPwForm] = useState({
    memberPw: '',
    memberPwConfirm: ''
  })
  const [pwError, setPwError] = useState('')

  // ── 아이디 찾기 핸들러 ──
  const handleIdSubmit = async (e) => {
    e.preventDefault()
    if (!idForm.memberName || !idForm.memberPhone) {
      showAlert('이름과 전화번호를 입력해주세요.')      
      return
    }
    const response = await findEmail(idForm.memberName, idForm.memberPhone)
    if (response?.status === 200) {
      setFoundEmail(response.data.email)
    } else {
      showAlert('일치하는 계정이 없습니다.')
    }
  }

  // ── 비밀번호 찾기 Step 1 핸들러 ──
  const handleVerify = async (e) => {
    e.preventDefault()
    const {memberEmail, memberName, memberPhone} = pwForm
    if (!memberEmail || !memberName || !memberPhone) {
      showAlert('모든 항목을 입력해주세요')
      return
    }
    const response = await verifyAccount(memberEmail, memberName, memberPhone)
    if (response?.data === true) {
      setStep(2)      
    } else {
      showAlert('입력하신 정보와 일치하는 계정이 없습니다.')
    }
  }

  // ── 비밀번호 찾기 Step 2 핸들러 ──
  const handleResetPw = async (e) => {
    e.preventDefault()
    if (newPwForm.memberPw !== newPwForm.memberPwConfirm) {
      setPwError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (newPwForm.memberPw.length < 8) {
      setPwError('비밀번호는 8자 이상 입력해주세요.')
      return
    }
    const response = await resetPw({
      memberEmail: pwForm.memberEmail,
      memberName: pwForm.memberName,
      memberPhone: pwForm.memberPhone,
      memberPw: newPwForm.memberPw,
    })
    if (response?.status === 200) {
      showAlert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      nav('/login')
    } else {
      showAlert('비밀번호 변경에 실패했습니다.')
    }
  }
  
  return (
    <div data-theme='light'>
      {/* 탭 */}
      <div className={styles.tabWrap}>
        <button
          className={`${styles.tab} ${tab === 'id' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('id')}
        >
          아이디 찾기
        </button>
        <button
          className={`${styles.tab} ${tab === 'pw' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('pw')}
        >
          비밀번호 찾기
        </button>
      </div>

      {/* 아이디 찾기 */}
      {tab === 'id' && (
        <Form title='아이디 찾기' onSubmit={handleIdSubmit} noValidate>
          <Input
            label='이름'
            name='memberName'
            placeholder='이름을 입력하세요'
            value={idForm.memberName}
            onChange={(e) => setIdForm({ ...idForm, memberName: e.target.value })}
          />
          <Input
            label='전화번호'
            name='memberPhone'
            placeholder='010-0000-0000'
            value={idForm.memberPhone}
            onChange={(e) => setIdForm({ ...idForm, memberPhone: e.target.value })}
          />
          <Button variant='dark' fullWidth type='submit'>찾기</Button>

          {foundEmail && (
            <div className={styles.result}>
              가입된 이메일: <strong>{foundEmail}</strong>
            </div>
          )}
        </Form>
      )}

      {/* 비밀번호 찾기 */}
      {tab === 'pw' && step === 1 && (
        <Form title='비밀번호 찾기' onSubmit={handleVerify} noValidate>
          <Input
            label='이메일'
            type='email'
            name='memberEmail'
            placeholder='가입 시 이메일 주소'
            value={pwForm.memberEmail}
            onChange={(e) => setPwForm({ ...pwForm, memberEmail: e.target.value })}
          />
          <Input
            label='이름'
            name='memberName'
            placeholder='이름을 입력하세요'
            value={pwForm.memberName}
            onChange={(e) => setPwForm({ ...pwForm, memberName: e.target.value })}
          />
          <Input
            label='전화번호'
            name='memberPhone'
            placeholder='010-0000-0000'
            value={pwForm.memberPhone}
            onChange={(e) => setPwForm({ ...pwForm, memberPhone: e.target.value })}
          />
          <Button variant='dark' fullWidth type='submit'>확인</Button>
        </Form>
      )}

      {tab === 'pw' && step === 2 && (
        <Form title='새 비밀번호 설정' onSubmit={handleResetPw} noValidate>
          <Input
            label='새 비밀번호'
            type='password'
            name='memberPw'
            placeholder='8자 이상 입력하세요'
            value={newPwForm.memberPw}
            onChange={(e) => { setNewPwForm({ ...newPwForm, memberPw: e.target.value }); setPwError('') }}
          />
          <Input
            label='새 비밀번호 확인'
            type='password'
            name='memberPwConfirm'
            placeholder='비밀번호를 다시 입력하세요'
            value={newPwForm.memberPwConfirm}
            onChange={(e) => { setNewPwForm({ ...newPwForm, memberPwConfirm: e.target.value }); setPwError('') }}
            error={pwError}
          />
          <Button variant='dark' fullWidth type='submit'>변경하기</Button>
        </Form>
      )}

      <div className={styles.loginLink}>
        <span onClick={() => nav('/login')}>로그인으로 돌아가기</span>
      </div>
    </div>
  )
}

export default FindAccount