import React, { useState } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'

const FanCard = ({ isOn, onOn, onOff, disabled }) => {
  const [speed, setSpeed] = useState(1.0)
  
  return (
    <div>
      <h3>팬</h3>
      <p>상태: {isOn ? 'ON' : 'OFF'}</p>

      <Input 
        type='range'
        name='fanSpeed'
        label={`속도: ${Math.round(speed * 100)}%`}
        min='0'
        max='1'
        step='0.1'
        value={speed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
        disabled={disabled}
      />

      <Button onClick={() => onOn(speed)} disabled={disabled || isOn}>
        ON
      </Button>
      <Button onClick={onOff} disabled={disabled || isOn} variant='secondary'>
        OFF
      </Button>
    </div>
  )
}

export default FanCard