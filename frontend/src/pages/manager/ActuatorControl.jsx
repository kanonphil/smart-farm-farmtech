import React, { useEffect, useState } from 'react'
import { buzzerOff, buzzerOn, fanOff, fanOn, getStatus, ledOff, ledOn, setMode } from '../../api/iotApi'
import PageTitle from '../../components/common/PageTitle'
import SensorCard from '../../components/actuatorControl/SensorCard'
import Button from '../../components/common/Button'
import ActuatorCard from '../../components/actuatorControl/ActuatorCard'
import FanCard from '../../components/actuatorControl/FanCard'
import LedCard from '../../components/actuatorControl/LedCard'

const ActuatorControl = () => {
  // 라즈베리파이에서 받아온 전체 데이터 저장
  const [status, setStatus] = useState(null)
  // 처음 데이터 불러오는 동안 로딩 표시
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // /status API 호출 함수
    const fetchStatus = async () => {
      try {
        const data = await getStatus()
        setStatus(data)
      } catch (error) {
        console.error('상태 조회 실패:', error);
      } finally {
        setLoading(false)
      }
    }
    
    fetchStatus()

    // 3초마다 자동으로 데이터 갱신
    const interval = setInterval(fetchStatus, 3000)
    // 페이지 벗어날 때 interval 정리 (메모리 누수 방지)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async(action) => {
    await action()
    const data = await getStatus()
    setStatus(data)
  }

  const isManual = status?.mode === 'manual'
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <PageTitle title='Actuator Control' />
      {/* 지금은 데이터가 어떻게 오는지 확인용으로 raw 출력 */}
      {/* <pre>{JSON.stringify(status, null, 2)}</pre> */}

      {/* 모드 전환 */}
      <div>
        <span>현재 모드: {status.mode.toUpperCase()}</span>
        <Button
          onClick={() => handleAction(() => setMode('auto'))}
          variant='primary'
          disabled={!isManual}
        >
          AUTO
        </Button>
        <Button
          onClick={() => handleAction(() => setMode('manual'))}
          variant='secondary'
          disabled={isManual}
        >
          MANUAL
        </Button>
      </div>

      {/* 센서 현황 */}
      <h2>센서 현황</h2>
      <div>
        <SensorCard label='온도' value={status.sensor.temperature} unit='℃' />
        <SensorCard label='습도' value={status.sensor.humidity} unit='%' />
        <SensorCard label='조도' value={status.sensor.lux} unit='lux' />
        <SensorCard label='대기질' value={status.sensor.air_ppm} unit='ppm' />
        <SensorCard label='모션' value={status.sensor.motion ? '감지' : '없음'} unit='' />
      </div>

      {/* 액츄에이터 제어 */}
      <h2>액츄에이터 제어</h2>
      <div>
        <LedCard 
          isOn={status.led.on}
          onOn={(brightness) => handleAction(() => ledOn(brightness))}
          onOff={() => handleAction(ledOff)}
          disabled={!isManual}
        />
        <ActuatorCard 
          label='부저'
          isOn={status.buzzer.on}
          onOn={() => handleAction(buzzerOn)}
          onOff={() => handleAction(buzzerOff)}
          disabled={!isManual}
        />
        <FanCard 
          isOn={status.fan.is_on}
          onOn={(speed) => handleAction(() => fanOn(speed))}
          onOff={() => handleAction(fanOff)}
          disabled={!isManual}
        />
      </div>
    </div>
  )
}

export default ActuatorControl