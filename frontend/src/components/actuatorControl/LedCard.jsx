import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './ActuatorCard.module.css'

const LedCard = ({ isOn, brightness: brightnessProp, onOn, onOff, disabled }) => {
  const [brightness, setBrightness] = useState(brightnessProp ?? 1.0)

  useEffect(() => {
    if (brightnessProp != null) setBrightness(brightnessProp)
  }, [brightnessProp])

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>LED</h3>
        <span className={`${styles.badge} ${isOn ? styles.badgeOn : styles.badgeOff}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      <Input 
        type='range'
        label={`밝기: ${Math.round(brightness * 100)}%`}
        labelStyle={{ color: '#4f4f4f' }}
        min='0.1'
        max='1'
        step='0.1'
        value={brightness}
        onChange={(e) => {
          const val = parseFloat(e.target.value)
          setBrightness(val)
          if (isOn && !disabled) onOn(val)
        }}
        disabled={disabled}
      />

      <div className={styles.controls}>
        <Button onClick={() => onOn(brightness)} disabled={disabled || isOn}>
          ON
        </Button>
        <Button onClick={onOff} disabled={disabled || !isOn} variant='danger'>
          OFF
        </Button>
      </div>
    </div>
  )
}

export default LedCard