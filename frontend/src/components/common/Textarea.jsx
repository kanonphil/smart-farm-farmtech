import styles from './Textarea.module.css'

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  rows = 4,
  maxLength,
  showCount = false
}) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
      />
      <div className={styles.footer}>
        {error && <span className={styles.error}>{error}</span>}
        {showCount && maxLength && (
          <span className={styles.count}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export default Textarea