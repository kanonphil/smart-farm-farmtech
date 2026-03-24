import styles from './AddressInput.module.css'

const AddressInput = ({ 
  label = "Address", 
  name = "address",
  onSearch, 
  addrValue = '', 
  detailValue = '', 
  onChange,
  required = false,
  disabled = false,
  error = ''
}) => {
  const handleDetailChange = (e) => {
    if (onChange) {
      onChange(addrValue, e.target.value)
    }
  }

  // 다음 우편번호 API 호출
  const handlePostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 선택한 주소 정보를 받아옴
        let fullAddress = data.address // 기본 주소
        let extraAddress = '' // 참고 항목

        // 도로명 주소인 경우 추가 정보 처리
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName)
          }
          fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '')
        }

        // 우편번호와 주소 정보를 state에 저장
        if (onChange) {
          onChange(fullAddress, detailValue)
        }

        // 검색 콜백 호출 (필요시)
        if (onSearch) {
          onSearch(data)
        }

        // 상세주소 input에 포커스
        setTimeout(() => {
          const detailInput = document.querySelector(`input[name="${name}-detail"]`)
          if (detailInput) {
            detailInput.focus()
          }
        }, 100)
      }
    }).open()
  }

  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      {/* 기본 주소 + 검색 버튼 */}
      <div className={styles.inputWithButton}>
        <input 
          type="text" 
          name={`${name}-addr`}
          placeholder="우편번호 검색" 
          className={`${styles.addrInput} ${error ? styles.addrInputError : ''}`}
          value={addrValue}
          readOnly={true}
          disabled={disabled}
        />
        <button 
          type="button"
          onClick={handlePostcode}
          className={styles.searchButton}
          disabled={disabled}
        >
          검색
        </button>
      </div>
      
      {/* 상세 주소 */}
      <div className={styles.detailInputWrapper}>
        <input 
          type="text" 
          name={`${name}-detail`}
          placeholder="상세주소" 
          className={`${styles.detailInput} ${error ? styles.detailInputError : ''}`}
          value={detailValue}
          onChange={handleDetailChange}
          disabled={disabled}
        />
      </div>
      
      {/* 에러 메시지 - 상세주소 아래에 표시 */}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

export default AddressInput