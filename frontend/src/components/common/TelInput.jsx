import styles from './TelInput.module.css'

const TelInput = ({ 
  label = "Phone Number", 
  name = "tel",
  value1 = '010', 
  value2 = '', 
  value3 = '', 
  onChange,
  required = false,
  disabled = false,
  error = ''
}) => {
  const handleChange = (index) => (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 허용
    const values = [value1, value2, value3]
    values[index] = value
    
    if (onChange) {
      onChange(values[0], values[1], values[2])
    }

    // 자동 포커스 이동
    if (value.length === e.target.maxLength && index < 2) {
      const inputs = e.target.parentElement.querySelectorAll('input')
      if (inputs[index + 1]) {
        inputs[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (index) => (e) => {
    // Backspace 시 이전 input으로 이동
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const inputs = e.target.parentElement.querySelectorAll('input')
      if (inputs[index - 1]) {
        inputs[index - 1].focus()
      }
    }
  }

  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.telGroup}>
        <input 
          type="text" 
          name={name}
          maxLength="3" 
          value={value1}
          onChange={handleChange(0)}
          onKeyDown={handleKeyDown(0)}
          className={`${styles.telInput} ${error ? styles.telInputError : ''}`}
          disabled={disabled}
          placeholder="010"
        />
        <span className={styles.separator}>-</span>
        <input 
          type="text" 
          name={name}
          maxLength="4"
          value={value2}
          onChange={handleChange(1)}
          onKeyDown={handleKeyDown(1)}
          className={`${styles.telInput} ${error ? styles.telInputError : ''}`}
          disabled={disabled}
          placeholder="0000"
        />
        <span className={styles.separator}>-</span>
        <input 
          type="text" 
          name={name}
          maxLength="4"
          value={value3}
          onChange={handleChange(2)}
          onKeyDown={handleKeyDown(2)}
          className={`${styles.telInput} ${error ? styles.telInputError : ''}`}
          disabled={disabled}
          placeholder="0000"
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

export default TelInput