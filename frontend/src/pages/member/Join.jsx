import { useEffect, useState } from 'react'
import Form from '../../components/common/Form'
import TelInput from '../../components/common/TelInput'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import AddressInput from '../../components/common/AddressInput'
import styles from './Join.module.css'
import { useNavigate } from 'react-router-dom'
import { checkEmailDuplicate, regMember } from '../../api/member/memberApi'
import Modal from '../../components/common/Modal'  

/**
 * 화살표함수 바깥에 쓰는 이유 : state가 변할 때마다 함수 전체가 다시 리렌더링됨
 * -> 바깥에 두면 페이지가 처음 로드될 때 딱 한번만 만들어지고 재사용된다.
 * -> 가독성을 고려해서.
 */
// 생년월일 옵션
const currentYear = new Date().getFullYear()
const years  = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12  }, (_, i) => i + 1)
const days   = Array.from({ length: 31  }, (_, i) => i + 1)

// 이메일 형식 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Join = () => {
  const nav = useNavigate()

  useEffect(() => {
    //스크립트가 로드돼 있는지 확인
    const isScriptExist = document.getElementById('daum-postcode-script');

    if(!isScriptExist){
      const script = document.createElement('script');
      script.id = 'daum.postcode-script'
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.body.appendChild(script) ;
    }
  })

  const [form, setForm] = useState({
    memName: '',
    memEmail: '',
    memPw: '',
    memPwCheck: '',
    tel1: '010', tel2: '', tel3: '',
    birthYear: '', birthMonth: '', birthDay: '',
    addr: '', addrDetail: ''
  })

  const [errors, setErrors] = useState({
    memName: '', memEmail: '', memPw: '', memPwCheck: '',
    tel: '', birth: '', addr: ''
  })

  // 유효성 통과 여부 (이름, 이메일, 비번, 비번확인 체크 아이콘)
  const [isValid, setIsValid] = useState({
    memName: false, memEmail: false, memPw: false, memPwCheck: false
  })

  // 이메일 중복확인 여부
  const [isEmailChecked, setIsEmailChecked] = useState(false)

  // 필드 유효성 검사
  const validateField = (field, value, currentForm) => {
    let error = ''
    if (field === 'memName') {
      if (value.trim() === '') error = '이름을 입력해주세요'
    }
    if (field === 'memEmail') {
      if (value === '') error = '이메일을 입력해주세요'
      else if (!emailRegex.test(value)) error = '올바른 이메일 형식이 아닙니다'
    }
    if (field === 'memPw') {
      if (value === '') error = '비밀번호를 입력해주세요'
      else if (value.length < 8) error = '8자 이상 입력해주세요'
    }
    if (field === 'memPwCheck') {
      if (value === '') error = '비밀번호 확인을 입력해주세요'
      else if (value !== currentForm.memPw) error = '비밀번호가 일치하지 않습니다'
    }
    setErrors(prev => ({ ...prev, [field]: error }))
    // 이메일은 중복확인 버튼을 눌러야만 valid
    if (field !== 'memEmail') {
      setIsValid(prev => ({ ...prev, [field]: error === '' && value.length > 0 }))
    }
  }

  // 입력값 변경 핸들러
  const handleChange = (field) => (e) => {
    const value = e.target.value
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    validateField(field, value, newForm)
    // 비밀번호 변경 시 비밀번호 확인 재검증
    if (field === 'memPw' && form.memPwCheck) {
      validateField('memPwCheck', form.memPwCheck, newForm)
    }
    // 이메일 변경 시 중복확인 초기화
    if (field === 'memEmail') {
      setIsEmailChecked(false)
      setIsValid(prev => ({ ...prev, memEmail: false }))
    }
  }

  // 이메일 중복확인 버튼
  const handleEmailCheck = async() => {
    if (!form.memEmail) {
      setErrors(prev => ({ ...prev, memEmail: '이메일을 입력해주세요' }))
      return
    }
    if (!emailRegex.test(form.memEmail)) {
      setErrors(prev => ({ ...prev, memEmail: '올바른 이메일 형식이 아닙니다' }))
      return
    }

    //[중요] axios 응답 객체 내부의 진짜 데이터(.data)가 true인지 확인
    //true면 중복!
    const response = await checkEmailDuplicate(form.memEmail);
    if(response.data){
      alert("이미 사용 중인 이메일입니다.");
      setIsEmailChecked(false);
      setIsValid(prev => ({ ...prev, memEmail: false }));
    }else{
      alert("사용 가능한 이메일입니다!")
      setIsEmailChecked(true)
      setErrors(prev => ({ ...prev, memEmail: '' }))
      setIsValid(prev => ({...prev,memEmail: true }))
    }
  }

  // 생년월일 변경 핸들러
  const handleBirthChange = (field, value) => {
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    const allFilled = newForm.birthYear !== '' && newForm.birthMonth !== '' && newForm.birthDay !== ''
    if (allFilled) setErrors(prev => ({ ...prev, birth: '' }))
  }

  // 전화번호 변경 핸들러
  const handleTelChange = (v1, v2, v3) => {
    setForm(prev => ({ ...prev, tel1: v1, tel2: v2, tel3: v3 }))
    const telIsValid = v2.length >= 3 && v3.length === 4
    setErrors(prev => ({ ...prev, tel: telIsValid ? '' : '전화번호를 입력해주세요' }))
  }

  // 주소 Input 클릭 → 다음 우편번호 API
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
          setForm(prev => ({ ...prev, addr: fullAddress }))
          setErrors(prev => ({ ...prev, addr: '' }))
          
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

  // 상세주소 변경 핸들러
  const handleAddrDetailChange = (e) => {
    setForm(prev => ({ ...prev, addrDetail: e.target.value }))
  }

  // 제출 핸들러
  const handleSubmit = async(e) => {
    // 1. 유효성 검사
    e.preventDefault()
    const checks = {
      memName:    form.memName.trim() === ''                            ? '이름을 입력해주세요'           : '',
      memEmail:   !form.memEmail                                        ? '이메일을 입력해주세요'          :
                  !emailRegex.test(form.memEmail)                       ? '올바른 이메일 형식이 아닙니다'  :
                  !isEmailChecked                                       ? '이메일 중복확인을 해주세요'     : '',
      memPw:      form.memPw === ''                                     ? '비밀번호를 입력해주세요'        :
                  form.memPw.length < 8                                 ? '8자 이상 입력해주세요'          : '',
      memPwCheck: form.memPwCheck === ''                                ? '비밀번호 확인을 입력해주세요'   :
                  form.memPw !== form.memPwCheck                        ? '비밀번호가 일치하지 않습니다'   : '',
      tel:        form.tel2.length < 3 || form.tel3.length < 4         ? '전화번호를 입력해주세요'        : '',
      birth:      !form.birthYear || !form.birthMonth || !form.birthDay ? '생년월일을 선택해주세요'        : '',
      addr:       form.addr === ''                                      ? '주소를 검색해주세요'            : ''
    }
    setErrors(checks)
    setIsValid({
      memName:    checks.memName    === '',
      memEmail:   checks.memEmail   === '',
      memPw:      checks.memPw      === '',
      memPwCheck: checks.memPwCheck === ''
    })
    //에러가 하나라도 있으면 중단
    if (Object.values(checks).some(msg => msg !== '')) {
      alert("입력 항목을 다시 확인해주세요.")
      return;
    }
    const joinData = {
      memberName: form.memName,
      memberEmail: form.memEmail,
      memberPw: form.memPw,
      memberPhone: `${form.tel1}-${form.tel2}-${form.tel3}`, // 전화번호 합치기
      memberBirth: `${form.birthYear}-${String(form.birthMonth).padStart(2,'0')}-${String(form.birthDay).padStart(2,'0')}`,
      memberAddr: form.addr,
      memberAddrDetail : form.addrDetail
    };
    try {
      const response = await regMember(joinData);
      console.log("서버 응답 데이터:", response.data);
      if (response.status >= 200 && response.status < 300) { // response 존재 여부 확인 추가
      alert("회원가입을 축하합니다. 로그인 페이지로 이동합니다.");
      nav('/login'); }
    } catch (error) {
    // 서버에서 보낸 에러 메시지가 있다면 띄워줌
      const errorMsg = error.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
      alert("회원가입 실패: " + errorMsg);
    }

    console.log('회원가입 데이터:', {
      memName:  form.memName,
      memEmail: form.memEmail,
      memPw:    form.memPw,
      tel:      `${form.tel1}-${form.tel2}-${form.tel3}`,
      birth:    `${form.birthYear}-${String(form.birthMonth).padStart(2,'0')}-${String(form.birthDay).padStart(2,'0')}`,
      addr:     `${form.addr} ${form.addrDetail}`.trim()
    })
  }

  console.log(form);
  return (
    <div className={styles.page} data-theme='light'>
      <Modal open={true} onClose={() => nav(-1)}>
        <div className={styles.formWrapper}>
          <Form 
            title='회원가입'
            onSubmit={handleSubmit} 
            noValidate
            className={styles.formInnerWrapper}
          >

            {/* 이름 - Input 컴포넌트 + 체크 아이콘 */}
            <div className={`${styles.fieldWrapper} ${errors.memName ? styles.hasError : ''}`}>
              <Input
                label='이름'
                type='text'
                name='memName'
                placeholder='이름을 입력해주세요'
                value={form.memName}
                onChange={handleChange('memName')}
                required
              />
              <span className={`${styles.checkIcon} ${isValid.memName ? styles.checkIconActive : ''}`}>✓</span>
              <span className={styles.errorMsg}>{errors.memName}</span>
            </div>

            {/* 이메일 - Input + 중복확인 버튼 + 체크 아이콘 */}
            <div className={`${styles.fieldWrapper} ${errors.memEmail ? styles.hasError : ''}`}>
              <Input
                label='이메일'
                type='email'
                name='memEmail'
                placeholder='이메일 주소 입력'
                value={form.memEmail}
                onChange={handleChange('memEmail')}
                button='중복확인'
                onButtonClick={handleEmailCheck}
                required
              />
              <span className={`${styles.checkIcon} ${isValid.memEmail ? styles.checkIconActive : ''}`}>✓</span>
              <span className={styles.errorMsg}>{errors.memEmail}</span>
            </div>

            {/* 비밀번호 - Input + 체크 아이콘 */}
            <div className={`${styles.fieldWrapper} ${errors.memPw ? styles.hasError : ''}`}>
              <Input
                label='비밀번호'
                type='password'
                name='memPw'
                placeholder='비밀번호 (8자 이상)'
                value={form.memPw}
                onChange={handleChange('memPw')}
                required
              />
              <span className={`${styles.checkIcon} ${isValid.memPw ? styles.checkIconActive : ''}`}>✓</span>
              <span className={styles.errorMsg}>{errors.memPw}</span>
            </div>

            {/* 비밀번호 확인 - Input + 체크 아이콘 */}
            <div className={`${styles.fieldWrapper} ${errors.memPwCheck ? styles.hasError : ''}`}>
              <Input
                label='비밀번호 확인'
                type='password'
                name='memPwCheck'
                placeholder='비밀번호 확인'
                value={form.memPwCheck}
                onChange={handleChange('memPwCheck')}
                required
              />
              <span className={`${styles.checkIcon} ${isValid.memPwCheck ? styles.checkIconActive : ''}`}>✓</span>
              <span className={styles.errorMsg}>{errors.memPwCheck}</span>
            </div>

            {/* 전화번호 - TelInput 공통 컴포넌트 */}
            <div className={`${styles.fieldWrapper} ${errors.tel ? styles.fieldError : ''}`}>
              <TelInput
                label='전화번호'
                name='tel'
                value1={form.tel1}
                value2={form.tel2}
                value3={form.tel3}
                onChange={handleTelChange}
                required
              />
              <span className={styles.errorMsg}>{errors.tel}</span>
            </div>

            {/* 생년월일 - Select 공통 컴포넌트 3개를 flex 배치 */}
            <div className={`${styles.fieldWrapper} ${errors.birth ? styles.birthError : ''}`}>
              <label className={styles.birthLabel}>
                생년월일<span className={styles.required}>*</span>
              </label>
              <div className={styles.birthRow}>
                <Select
                  name='birthYear'
                  value={form.birthYear}
                  onChange={(e) => handleBirthChange('birthYear', e.target.value)}
                  options={years.map(y => ({ value: String(y), label: `${y}년` }))}
                  placeholder='연도'
                />
                <Select
                  name='birthMonth'
                  value={form.birthMonth}
                  onChange={(e) => handleBirthChange('birthMonth', e.target.value)}
                  options={months.map(m => ({ value: String(m), label: `${m}월` }))}
                  placeholder='월'
                />
                <Select
                  name='birthDay'
                  value={form.birthDay}
                  onChange={(e) => handleBirthChange('birthDay', e.target.value)}
                  options={days.map(d => ({ value: String(d), label: `${d}일` }))}
                  placeholder='일'
                />
              </div>
              <span className={styles.errorMsg}>{errors.birth}</span>
            </div>

            {/* 주소 - Input 클릭 시 다음 주소 검색창 열림 */}
            <div className={`${styles.fieldWrapper} ${styles.addrWrapper} ${errors.addr ? styles.hasError : ''}`}>
              <Input
                label='주소'
                name='addr-addr'
                placeholder='클릭하여 주소 검색'
                value={form.addr}
                readOnly
                onClick={handleAddrClick}
                required
              />
              <Input
                label='상세주소'
                name='addr-detail'
                placeholder='상세주소 입력'
                value={form.addrDetail}
                onChange={handleAddrDetailChange}
              />
              <span className={styles.errorMsg}>{errors.addr}</span>
            </div>

            {/* 제출 버튼 */}
            <Button 
              type='submit' 
              fullWidth 
              className={styles.submitBtn}
              >
              제출
            </Button>
            <Button type='button' fullWidth className={styles.linkBtn} onClick={() => nav(-1)}>
              이미 계정이 있습니다
            </Button>

          </Form>
        </div>
      </Modal>
      
    </div>
  )
}

export default Join
