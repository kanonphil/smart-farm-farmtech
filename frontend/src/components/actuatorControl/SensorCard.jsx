import React from 'react'

// label: 카드 제목 (예: 온도, 습도)
// value: 실제 값 (예: 24.5)
// unit: 단위 (예: ℃, %, lux)
const SensorCard = ({ label, value, unit }) => {
  return (
    <div>
      <h3>{label}</h3>
      {/* 값이 없을 때 - 표시 */}
      <p>{value !== null && value !== undefined ? `${value} ${unit}` : '-'}</p>
    </div>
  )
}

export default SensorCard