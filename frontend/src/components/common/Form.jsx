import styles from './Form.module.css'

const Form = ({
  children,
  title,
  subtitle,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.formContainer} ${className}`}>
      {title && <h2 className={styles.formTitle}>{title}</h2>}
      {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
      <form onSubmit={onSubmit} {...props}>
        {children}
      </form>
    </div>
  )
}

export default Form