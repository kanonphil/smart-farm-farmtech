import React, { useEffect, useState } from 'react'
import Form from '../../components/common/Form'
import styles from './EditInfo.module.css'
import Input from '../../components/common/Input'
import { decodeToken } from '../../utils/tokenUtils'
import { getAllInfo, setInfo } from '../../api/member/memberApi'
import Button from '../../components/common/Button'
import useAuthStore from '../../store/authStore'

/**
 * 내 정보 수정 페이지
 */
const EditInfo = () => {
  const { token, showAlert } = useAuthStore()
  const decoded = decodeToken(token)

  const [memberInfo, setMemberInfo] = useState({})
  const [errors, setErrors] = useState({ 
    memberName: '', 
    memberPhone: '', 
    memberBirth: '', 
    memberAddr: '' 
  })

  /** 회원 전체 정보 조회 */
  const getMemberInfo = async () => {
    const response = await getAllInfo(decoded.sub)
    setMemberInfo(response.data)
  }

  /** 전화번호 000-0000-0000 포맷 */
  const formatPhone = (value) => {
    const num = value.replace(/\D/g, '')
    if (num.length <= 3) return num
    if (num.length <= 7) return `${num.slice(0,3)}-${num.slice(3)}`
    return `${num.slice(0,3)}-${num.slice(3,7)}-${num.slice(7,11)}`
  }

  /** 생년월일 0000-00-00 포맷 */
  const formatBirth = (value) => {
    const num = value.replace(/\D/g, '')
    if (num.length <= 4) return num
    if (num.length <= 6) return `${num.slice(0,4)}-${num.slice(4)}`
    return `${num.slice(0,4)}-${num.slice(4,6)}-${num.slice(6,8)}`
  }

  useEffect(() => {
    if (!token) return
    getMemberInfo()
    const isScriptExist = document.getElementById('daum-postcode-script')
    if (!isScriptExist) {
      const script = document.createElement('script')
      script.id = 'daum-postcode-script'
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  /** 입력값 변경 핸들러 */
  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'memberPhone') value = formatPhone(value)
    if (field === 'memberBirth') value = formatBirth(value)
    setMemberInfo(prev => ({ ...prev, [field]: value }))
  }

  /** 주소 검색 (다음 우편번호) */
  const handleAddrClick = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data) => {
          let fullAddress = data.address
          let extra = ''
          if (data.addressType === 'R') {
            if (data.bname) extra += data.bname
            if (data.buildingName) extra += (extra ? ', ' : '') + data.buildingName
            if (extra) fullAddress += ` (${extra})`
          }
          setMemberInfo(prev => ({ ...prev, memberAddr: fullAddress }))
          setTimeout(() => document.querySelector('input[name="addr-detail"]')?.focus(), 100)
        }
      }).open()
    } else {
      showAlert('주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.')
    }
  }

  /** 제출 핸들러 */
  const handleSubmit = async () => {
    const newErrors = {}
    if (!memberInfo.memberName) newErrors.memberName = '이름을 입력해주세요'
    if (!memberInfo.memberPhone) newErrors.memberPhone = '전화번호를 입력해주세요'
    else if (!/^\d{3}-\d{4}-\d{4}$/.test(memberInfo.memberPhone)) newErrors.memberPhone = '올바른 전화번호 형식이 아닙니다'
    if (!memberInfo.memberBirth) newErrors.memberBirth = '생년월일을 입력해주세요'
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(memberInfo.memberBirth)) newErrors.memberBirth = '올바른 생년월일 형식이 아닙니다'
    if (!memberInfo.memberAddr) newErrors.memberAddr = '주소를 입력해주세요'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const response = await setInfo(memberInfo)
    if (response?.status === 200) showAlert('수정 완료')
    else showAlert('수정 실패')
  }

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>내 정보 수정</h2>
        <p className={styles.pageSubtitle}>회원 정보를 확인하고 수정할 수 있습니다.</p>
      </div>

      {/* 폼 카드 */}
      <div className={styles.card}>
        <Input label='이메일' value={memberInfo.memberEmail} readOnly 
        />
        <Input 
          label='이름' 
          name='memberName' 
          value={memberInfo.memberName} 
          onChange={handleChange('memberName')} 
          error={errors.memberName} 
          required 
        />
        <Input 
          label='전화번호' 
          name='memberPhone' 
          value={memberInfo.memberPhone} 
          onChange={handleChange('memberPhone')} 
          error={errors.memberPhone} 
          required 
        />
        <Input 
          label='생년월일' 
          name='memberBirth' 
          value={memberInfo.memberBirth} 
          onChange={handleChange('memberBirth')} 
          error={errors.memberBirth} 
          required 
        />
        <Input 
          label='주소' 
          name='addr-addr' 
          value={memberInfo.memberAddr} 
          readOnly 
          onClick={handleAddrClick} 
          error={errors.memberAddr} 
          required 
        />
        <Input 
          label='상세주소' 
          name='addr-detail' 
          value={memberInfo.memberAddrDetail} 
          onChange={handleChange('memberAddrDetail')} 
        />
        <Button type='button' fullWidth onClick={handleSubmit}>수정 완료</Button>
      </div>
    </div>
  )
}

export default EditInfo
