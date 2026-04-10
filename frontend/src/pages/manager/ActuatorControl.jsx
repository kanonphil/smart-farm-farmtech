import { useEffect, useRef, useState } from 'react'
import { buzzerOff, buzzerOn, fanOff, fanOn, getStatus, ledOff, ledOn, setMode } from '../../api/iotApi'
import PageTitle from '../../components/common/PageTitle'
import SensorCard from '../../components/actuatorControl/SensorCard'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Input from '../../components/common/Input'
import ActuatorCard from '../../components/actuatorControl/ActuatorCard'
import FanCard from '../../components/actuatorControl/FanCard'
import LedCard from '../../components/actuatorControl/LedCard'
import styles from './ActuatorControl.module.css'
import { activatePreset, createPreset, deletePreset, getPresets, getSensor, updatePreset } from '../../api/managerApi'
import { MdAir, MdSensors, MdThermostat, MdWarning, MdWaterDrop, MdWbSunny } from 'react-icons/md'

/** 임계값 폼 초기화 */
const EMPTY_FORM = {
  name: '',
  tempLow: '', tempHigh: '',
  humLow: '', humHigh: '',
  airPpmLow: '', airPpmBad: '',
  luxLow: '', luxHigh: '',
}

/**
 * 센서 측정값과 활성 프리셋을 비교하여 상태 레이블을 반환
 * @param {'temperature'|'humidity'|'lux'|'air'} type
 * @param {number} value
 * @param {object|null} preset
 * @returns {{ label: string, level: string }|null}
 */
const getSensorStatus = (type, value, preset) => {
  if (!preset || value === null || value === undefined) return null
  const make = (statusLabel, statusLevel) => ({ statusLabel, statusLevel })
  switch (type) {
    case 'temperature':
      if (value < preset.tempLow)  return make('낮음', 'low')
      if (value > preset.tempHigh) return make('높음', 'high')
      return make('적정', 'good')
    case 'humidity':
      if (value < preset.humLow)  return make('부족', 'low')
      if (value > preset.humHigh) return make('과다', 'high')
      return make('적정', 'good')
    case 'lux':
      if (value < preset.luxLow)  return make('부족', 'low')
      if (value > preset.luxHigh) return make('과다', 'high')
      return make('적정', 'good')
    case 'air':
      if (value < preset.airPpmLow) return make('좋음', 'great')
      if (value > preset.airPpmBad) return make('나쁨', 'bad')
      return make('적정', 'good')
    default:
      return {}
  }
}

const ActuatorControl = () => {
  // 라즈베리파이에서 받아온 전체 데이터 저장
  const [status, setStatus] = useState(null)
  // 처음 데이터 불러오는 동안 로딩 표시
  const [loading, setLoading] = useState(true)

  // 임계값 프리셋
  const [presets, setPresets] = useState([])
  // 수정 중인 프리셋 id (null 이면 신규 추가 모드)
  const [editingId, setEditingId] = useState(null)
  // 폼 표시 여부
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  /** 활성 프리셋 (파생값) */
  const activePreset = presets.find(p => p.active) || null

  /** 라즈베리파이 서버 연결 상태 */
  const [isConnected, setIsConnected] = useState(true)

  /** IoT 첫 연결 실패 시 DB에서 불러온 마지막 센서값 */
  const [fallbackSensor, setFallbackSensor] = useState(null)
  /** 폴백 데이터 측정 시각 */
  const [fallbackRecordedAt, setFallbackRecordedAt] = useState(null)

  const intervalRef = useRef(null)

  // /status API 호출 함수
  const fetchStatus = async () => {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000) // 3초 안에 응답 없으면 실패
    )
      const data = await Promise.race([getStatus(), timeout])
      setStatus(data)
      setIsConnected(true)
      // 폴링이 멈춰있었으면 재시작
      if (!intervalRef.current) startPolling(fetchStatus)
    } catch (error) {
      console.error('상태 조회 실패:', error);
      setIsConnected(false)
      // 연결 실패 시 폴링 중단
      stopPolling()

      // 첫 연결 실패이고 아직 폴백도 없을 때만 DB 조회
      if (!status && !fallbackSensor) {
        try {
          const db = await getSensor()
          const d = db.data ?? db

          setFallbackSensor({
            temperature: d.dht?.[0]?.temperature ?? null,
            humidity: d.dht?.[0]?.humidity ?? null,
            lux: d.light?.lightValue ?? null,
            air_ppm: d.air?.rawValue ?? null,
          })
          setFallbackRecordedAt(
            d.dht?.[0]?.recordedAt ?? d.light?.recordedAt ?? d.air?.recordedAt ?? null
          )
        } catch (dbError) {
          console.error('DB 센서 조회 실패:', dbError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    startPolling(fetchStatus)
    return () => stopPolling()

    // 3초마다 자동으로 데이터 갱신
    // const interval = setInterval(fetchStatus, 3000)
    // 페이지 벗어날 때 interval 정리 (메모리 누수 방지)
    // return () => clearInterval(interval)
  }, [])

  // 프리셋 목록 불러오기
  const fetchPresets = async () => {
    try {
      const data = await getPresets()
      if (data) setPresets(data)
    } catch (e) {
      console.error('프리셋 조회 실패:', e)
    }
  }

  useEffect(() => {
    fetchPresets()
  }, [])

  // 액츄에이터 핸들러
  const handleAction = async(action) => {
    await action()
    const data = await getStatus()
    setStatus(data)
  }

  // 임계값 폼 핸들러
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // 추가 버튼 클릭 -> 빈 폼 표시
  const handleAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  // 수정 버튼 클릭 -> 해당 프리셋 값으로 폼 채우기
  const handleEdit = (preset) => {
    setEditingId(preset.id)
    setForm({
      name: preset.name,
      tempLow: preset.tempLow, tempHigh: preset.tempHigh,
      humLow: preset.humLow, humHigh: preset.humHigh,
      airPpmLow: preset.airPpmLow, airPpmBad: preset.airPpmBad,
      luxLow: preset.luxLow, luxHigh: preset.luxHigh,
    })
    setShowForm(true)
  }

  // 저장 (추가 or 수정)
  const handleSubmit = async() => {
    if (editingId !== null) {
      await updatePreset(editingId, form)
    } else {
      await createPreset(form)
    }
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
    fetchPresets()
  }

  // 삭제
  const handleDelete = async (id) => {
    await deletePreset(id)
    fetchPresets()
  }

  // 활성화
  const handleActivate = async (id) => {
    await activatePreset(id)
    fetchPresets()
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startPolling = (fn) => {
    stopPolling()
    intervalRef.current = setInterval(fn, 3000)
  }
  
  const tableHeaders = [[
    { label: '프리셋 이름', rowSpan: 2, style: { verticalAlign: 'middle' } },
    { label: '온도 (℃)', colSpan: 2 },
    { label: '습도 (%)', colSpan: 2 },
    { label: '대기질 (ppm)', colSpan: 2 },
    { label: '조도 (lux)', colSpan: 2 },
    { label: '상태', rowSpan: 2, style: { width: '80px', verticalAlign: 'middle' } },
    { label: '설정', rowSpan: 2, style: { verticalAlign: 'middle' } },
  ],[
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
  ]]

  
  if (loading && !status) return (
    <div className={styles.loadingWrap}>
      <div className={styles.spinner} />
    </div>
  )
  if (!status && !isConnected && !fallbackSensor) {
    return <div className={styles.connectionError}>서버와 연결할 수 없습니다.</div>
  }
  
  const isManual = status?.mode === 'manual'
  // 실시간 연결 시 IoT 데이터, 끊겼을 때 DB 폴백 데이터 사용
  const sensorData = status?.sensor ?? fallbackSensor
  
  return (
    <div className={styles.container}>
      <PageTitle title='기기 제어' />
      {/* 지금은 데이터가 어떻게 오는지 확인용으로 raw 출력 */}
      {/* <pre>{JSON.stringify(status, null, 2)}</pre> */}

      {!isConnected && (
        <div className={styles.connectionBanner}>
          <div className={styles.bannerLeft}>
            <MdWarning size={20} color='#c2410c' />
            <span>서버와 연결이 끊겼습니다. 마지막으로 측정된 값을 표시합니다.</span>
          </div>
          <Button
            size='small'
            onClick={fetchStatus}
            variant='dark'
            disabled={isConnected}
          >재연결 시도</Button>
        </div>
      )}

      {/* 모드 전환 — IoT 연결 시에만 표시 */}
      {status && (
        <div className={styles.modeSection}>
          <span className={styles.modeLabel}>현재 모드:</span>
          <span className={`${styles.modeBadge} ${isManual ? styles.modeManual : styles.modeAuto}`}>
            {status.mode.toUpperCase()}
          </span>
          <div className={styles.modeButtons}>
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
        </div>
      )}

      {/* 센서 현황 */}
      <h2 className={styles.sectionTitle}>
        센서 현황 {!status && fallbackSensor && <span className={styles.fallbackLabel}>(마지막 기록)</span>}
      </h2>
      <div className={styles.sensorGrid}>
        <SensorCard 
          label='온도' 
          value={sensorData?.temperature} 
          unit='℃' 
          icon={<MdThermostat size={22} color='#f97316' />}
          {...getSensorStatus('temperature', sensorData?.temperature, activePreset)}
        />
        <SensorCard
          label='습도'
          value={sensorData?.humidity}
          unit='%'
          icon={<MdWaterDrop size={22} color='#3b82f6' />}
          {...getSensorStatus('humidity', sensorData?.humidity, activePreset)}
        />
        <SensorCard
          label='조도'
          value={sensorData?.lux}
          unit='lux'
          icon={<MdWbSunny size={22} color='#eab308' />}
          {...getSensorStatus('lux', sensorData?.lux, activePreset)}
        />
        <SensorCard
          label='대기질'
          value={sensorData?.air_ppm}
          unit='ppm'
          icon={<MdAir size={22} color='#10b981' />}
          {...getSensorStatus('air', sensorData?.air_ppm, activePreset)}
        />
        <SensorCard 
          label='모션' 
          value={status ? (status.sensor.motion ? '감지' : '없음') : '알 수 없음'} 
          unit=''
          icon={<MdSensors size={22} color='#8b5cf6' />} 
        />
      </div>

      {/* 액츄에이터 제어 */}
      <h2 className={styles.sectionTitle}>액츄에이터 제어</h2>
      {!status ? (
        <p className={styles.noData}>서버 연결 시 제어할 수 있습니다.</p>
      ) : (
        <div className={styles.actuatorGrid}>
          <LedCard
            isOn={status.led.is_on}
            brightness={status.led.brightness}
            onOn={(brightness) => handleAction(() => ledOn(brightness))}
            onOff={() => handleAction(ledOff)}
            disabled={!isManual}
          />
          <ActuatorCard 
            label='부저'
            isOn={status.buzzer.is_on}
            onOn={() => handleAction(buzzerOn)}
            onOff={() => handleAction(buzzerOff)}
            disabled={!isManual}
          />
          <FanCard
            isOn={status.fan.is_on}
            speed={status.fan.speed}
            onOn={(speed) => handleAction(() => fanOn(speed))}
            onOff={() => handleAction(fanOff)}
            disabled={!isManual}
          />
        </div>
      )}

      {/* 임계값 프리셋 */}
      <h2 className={`${styles.sectionTitle} ${styles.thresholdTitle}`}>임계값 설정</h2>
      <div className={styles.addRow}>
        <Button size='small' onClick={handleAdd} variant='primary'>+ 프리셋 추가</Button>
      </div>

      {/* 프리셋 목록 테이블 */}
      <Table 
        headers={tableHeaders}
        data={presets}
        renderRow={(preset) => (
          <>
            <td>{preset.name}</td>
            <td>{preset.tempLow}</td> 
            <td>{preset.tempHigh}</td>
            <td>{preset.humLow}</td> 
            <td>{preset.humHigh}</td>
            <td>{preset.airPpmLow}</td> 
            <td>{preset.airPpmBad}</td>
            <td>{preset.luxLow}</td> 
            <td>{preset.luxHigh}</td>
            <td>
              <span className={`${styles.badge} ${preset.active ? styles.badgeActive : styles.badgeInactive}`}>
                {preset.active ? '적용중' : '미적용'}
              </span>
            </td>
            <td>
              <div className={styles.actions}>
                <Button
                  size='small'
                  variant='primary'
                  onClick={() => handleActivate(preset.id)}
                  disabled={preset.active}
                >
                  적용
                </Button>
                <Button
                  size='small'
                  variant='secondary'
                  onClick={() => handleEdit(preset)}
                >
                  수정
                </Button>
                <Button
                  size='small'
                  variant='danger'
                  onClick={() => handleDelete(preset.id)}
                  disabled={preset.active}
                >
                  삭제
                </Button>
              </div>
            </td>
          </>
        )}
      />

      {/* 추가/수정 폼 */}
      {showForm && (
        <div className={styles.form} data-theme='light'>
          <h2 className={styles.formTitle}>{editingId !== null ? '프리셋 수정' : '프리셋 추가'}</h2>
          <div className={styles.formGrid}>
            <Input label='프리셋 이름' labelStyle={{ color: '#000000' }} name='name' value={form.name} onChange={handleChange} />
            <Input label='온도 하한 (℃)' labelStyle={{ color: '#000000' }} name='tempLow' type='number' value={form.tempLow} onChange={handleChange} />
            <Input label='온도 상한 (℃)' labelStyle={{ color: '#000000' }} name='tempHigh' type='number' value={form.tempHigh} onChange={handleChange} />
            <Input label='습도 하한 (%)' labelStyle={{ color: '#000000' }} name='humLow' type='number' value={form.humLow} onChange={handleChange} />
            <Input label='습도 상한 (%)' labelStyle={{ color: '#000000' }} name='humHigh' type='number' value={form.humHigh} onChange={handleChange} />
            <Input label='대기질 하한 (ppm)' labelStyle={{ color: '#000000' }} name='airPpmLow' type='number' value={form.airPpmLow} onChange={handleChange} />
            <Input label='대기질 상한 (ppm)' labelStyle={{ color: '#000000' }} name='airPpmBad' type='number' value={form.airPpmBad} onChange={handleChange} />
            <Input label='조도 하한 (lux)' labelStyle={{ color: '#000000' }} name='luxLow' type='number' value={form.luxLow} onChange={handleChange} />
            <Input label='조도 상한 (lux)' labelStyle={{ color: '#000000' }} name='luxHigh' type='number' value={form.luxHigh} onChange={handleChange} />
          </div>
          <div className={styles.formButtons}>
            <Button onClick={handleSubmit} variant='primary'>저장</Button>
            <Button onClick={() => setShowForm(false)} variant='dart'>취소</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActuatorControl