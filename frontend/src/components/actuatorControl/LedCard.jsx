import React, { useState } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'

const LedCard = ({ isOn, onOn, onOff, disabled }) => {
  const [brightness, setBrightness] = useState(1.0)

  return (
    <div>
      <h3>LED</h3>
      <p>상태: {isOn ? 'ON' : 'OFF'}</p>

      <Input 
        type='range'
        label={`밝기: ${Math.round(brightness * 100)}%`}
        min='0.1'
        max='1'
        step='0.1'
        value={brightness}
        onChange={(e) => setBrightness(parseFloat(e.target.value))}
        disabled={disabled}
      />

      <Button onClick={() => onOn(brightness)} disabled={disabled || isOn}>
        ON
      </Button>
      <Button onClick={onOff} disabled={disabled || isOn} variant='secondary'>
        OFF
      </Button>
    </div>
  )
}

export default LedCard