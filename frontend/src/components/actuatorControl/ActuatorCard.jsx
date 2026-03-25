import React from 'react'
import Button from '../common/Button'

// label: 카드 제목 (예: LED, 부저)
// isOn: 현재 ON/OFF 상태
// onOn: ON 버튼 클릭 시 실행할 함수
// onOff: OFF 버튼 클릭 시 실행할 함수
// disabled: auto 모드일 때 버튼 비활성화
const ActuatorCard = ({ label, isOn, onOn, onOff, disabled }) => {
  return (
    <div>
      <h3>{label}</h3>
      <p>상태: {isOn ? 'ON' : 'OFF'}</p>
      <Button onClick={onOn} disabled={disabled || isOn}>
        ON
      </Button>
      <Button onClick={onOff} disabled={disabled || isOn} variant="secondary">
        OFF
      </Button>
    </div>
  )
}

export default ActuatorCard