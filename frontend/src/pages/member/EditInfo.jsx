import React, { useEffect, useState } from 'react'
import Form from '../../components/common/Form'
import styles from './EditInfo.module.css'
import Input from '../../components/common/Input'
import { decodeToken } from '../../utils/tokenUtils'
import { getAllInfo, setInfo } from '../../api/member/memberApi'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'

const EditInfo = () => {
  const nav = useNavigate()
  
  //로그인 회원 토큰 정보 저장 변수
  const decoded = decodeToken(localStorage.getItem('token'))

  //로그인 한 회원 전체 정보 저장 state 변수
  const [memberInfo, setMemberInfo] = useState({})
  
  //에러메세지 저장 state 변수
  const [errors, setErrors] = useState({
    memberName: '',
    memberPhone: '',
    memberBirth: '',
    memberAddr: ''
  })

  //로그인 회원 전체 정보 조회 함수
  const getMemberInfo = async () => {
    const response = await getAllInfo(decoded.sub);
    setMemberInfo(response.data)
  }

  //전화 번호 입력 시 000-0000-0000 형식으로 저장하는 변수
  const formatPhone = (value) => {
  const num = value.replace(/\D/g, '') // 숫자만 추출
    if (num.length <= 3) return num
    if (num.length <= 7) return `${num.slice(0,3)}-${num.slice(3)}`
    return `${num.slice(0,3)}-${num.slice(3,7)}-${num.slice(7,11)}`
  }

  
  //생년월일 입력 시 0000-00-00 형식으로 저장하는 변수
  const formatBirth = (value) => {
    const num = value.replace(/\D/g, '')
    if (num.length <= 4) return num
    if (num.length <= 6) return `${num.slice(0,4)}-${num.slice(4)}`
    return `${num.slice(0,4)}-${num.slice(4,6)}-${num.slice(6,8)}`
  }
  
  useEffect(()=>{
    getMemberInfo();
    //스크립트가 로드돼 있는지 확인
    const isScriptExist = document.getElementById('daum-postcode-script');
    if(!isScriptExist){
      const script = document.createElement('script');
      script.id = 'daum.postcode-script'
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.body.appendChild(script) ;
    }
  },[])

  console.log(memberInfo)

  //입력값 변경 핸들러
  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'memberPhone') value = formatPhone(value)
    if (field === 'memberBirth') value = formatBirth(value)
    const newForm = {...memberInfo, [field]:value}
    setMemberInfo(newForm)
  }
  
  //주소 입력 변경 핸들러
  const handleAddrClick = () => {
    // window.daum 존재 여부 확인 후 실행
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
          setMemberInfo(prev => ({ ...prev, memberAddr : fullAddress }))
          
          // 상세주소 input에 포커스 (name='addr-detail'로 되어있으므로 수정)
          setTimeout(() => {
            document.querySelector('input[name="addr-detail"]')?.focus()
          }, 100)
        }
      }).open()
    } else {
      alert("주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    }
  }

  //제출 핸들러
  const handleSubmit = async () => {
    const newErrors = {}

    if (!memberInfo.memberName) newErrors.memberName = '이름을 입력해주세요'
    
    if (!memberInfo.memberPhone) newErrors.memberPhone = '전화번호를 입력해주세요'
    else if (!/^\d{3}-\d{4}-\d{4}$/.test(memberInfo.memberPhone)) newErrors.memberPhone = '올바른 전화번호 형식이 아닙니다'

    if (!memberInfo.memberBirth) newErrors.memberBirth = '생년월일을 입력해주세요'
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(memberInfo.memberBirth)) newErrors.memberBirth = '올바른 생년월일 형식이 아닙니다'

    if (!memberInfo.memberAddr) newErrors.memberAddr = '주소를 입력해주세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const response = await setInfo(memberInfo)
    if(response?.status === 200){
      alert('수정 완료')
    }
    else{
      alert('수정 실패')
    }
  }


  return (
    <div className={styles.container} data-theme='light'>
      <Form title='회원 정보 수정' noValidate>
        <Input
          label='이메일'
          value={memberInfo.memberEmail}
          readOnly
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
        {/* 주소 - Input 클릭 시 다음 주소 검색창 열림 */}
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
        <Button 
          type='button' 
          fullWidth
          onClick={e => handleSubmit()}
        >
          수정 완료
        </Button>
      </Form>
      
    </div>
  )
}

export default EditInfo
