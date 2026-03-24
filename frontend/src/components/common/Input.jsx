import { forwardRef } from 'react'
import styles from './Input.module.css'
import Button from './Button'

const Input = forwardRef(({ 
  label, 
  type = "text", 
  name,
  placeholder = '', 
  value = '',
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  maxLength,
  button,
  onButtonClick,
  className = '',
  ...props
}, ref) => {
  // file 타입은 value 제어 불가 -> onChange만 전달
  const inputProps = type === 'file'
    ? { onChange }
    : { value, onChange }

  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      {button ? (
        // 버튼이 있는 경우 (중복확인, 주소검색 등)
        <div className={styles.inputWithButton}>
          <input 
            id={name}
            type={type}
            name={name}
            placeholder={type === 'date' ? undefined : placeholder}
            value={value}
            onChange={onChange}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onClick={(e) => {
              if (type === 'date') {
                e.target.showPicker?.();
              }
            }}
            {...props}
          />
          <Button 
            onClick={onButtonClick} 
            variant='primary'
            type='button'
            disabled={disabled}
          >
            {button}
          </Button>
        </div>
      ) : (
        // 일반 input
        <input 
          id={name}
          type={type}
          name={name}
          placeholder={type === 'date' || type === 'file' ? undefined : placeholder}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          onClick={(e) => {
            if (type === 'date') {
              e.target.showPicker?.();
            }
          }}
          ref={ref}
          {...inputProps}
          {...props}
        />
      )}
      
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
})

export default Input