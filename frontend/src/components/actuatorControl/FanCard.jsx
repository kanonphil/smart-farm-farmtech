import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './ActuatorCard.module.css'

const FanCard = ({ isOn, speed: speedProp, onOn, onOff, disabled }) => {
  const [speed, setSpeed] = useState(speedProp ?? 1.0)

  useEffect(() => {
    if (speedProp != null) setSpeed(speedProp)
  }, [speedProp])
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>팬</h3>
        <span className={`${styles.badge} ${isOn ? styles.badgeOn : styles.badgeOff}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      <Input 
        type='range'
        name='fanSpeed'
        label={`속도: ${Math.round(speed * 100)}%`}
        labelStyle={{ color: '#4f4f4f' }}
        min='0.1'
        max='1'
        step='0.1'
        value={speed}
        onChange={(e) => {
          const val = parseFloat(e.target.value)
          setSpeed(val)
          if (isOn && !disabled) onOn(val)
        }}
        disabled={disabled}
      />

      <div className={styles.controls}>
        <Button onClick={() => onOn(speed)} disabled={disabled || isOn}>
          ON
        </Button>
        <Button onClick={onOff} disabled={disabled || !isOn} variant='danger'>
          OFF
        </Button>
      </div>
    </div>
  )
}

export default FanCard