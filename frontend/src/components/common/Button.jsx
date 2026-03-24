import styles from './Button.module.css'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button