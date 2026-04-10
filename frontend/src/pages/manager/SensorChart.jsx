import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { getSensorHistory } from '../../api/managerApi'
import { getCurrentWeather } from '../../api/weatherApi'
import PageTitle from '../../components/common/PageTitle'
import styles from './SensorChart.module.css'
import { aggregateByDay, aggregateByHour, aggregateByMonth, aggregateByWeek, aggregateByYear, daysAgo, today } from '../../utils/sensorAggregate'
import WeatherCard from '../../components/sensor/WeatherCard'
import SensorFilterBar from '../../components/sensor/SensorFilterBar'
import SensorAllGrid from '../../components/sensor/SensorAllGrid'
import SensorAreaChart from '../../components/sensor/SensorAreaChart'

/** 탭 정의 */
const TABS = [
  { key: 'all', label: '전체',   unit: '',    color: '#1a1a1a' },
  { key: 'temperature', label: '온도',   unit: '°C',  color: '#ef4444' },
  { key: 'humidity', label: '습도',   unit: '%',   color: '#3b82f6' },
  { key: 'light', label: '조도',   unit: 'lux', color: '#f59e0b' },
  { key: 'air', label: '대기질', unit: 'ppm', color: '#8b5cf6' },
]

/** 빠른 날짜 선택 옵션 */
const QUICK_RANGES = [
  { label: '오늘', type: 'daily',   days: 0 },
  { label: '주간', type: 'weekly',  days: 7 },
  { label: '월간', type: 'monthly' },
  { label: '연간', type: 'yearly'  },
]

const todayStr = today()

/**
 * 센서 데이터 분석 페이지
 */
const SensorChart = () => {
  const [startDate, setStartDate]  = useState(todayStr)
  const [endDate, setEndDate]  = useState(todayStr)
  const [activeTab, setActiveTab]  = useState('all')
  const [activeRange, setActiveRange] = useState('오늘')
  const [rangeType, setRangeType]  = useState('daily')
  const [history, setHistory]  = useState(null)
  const [weather, setWeather]  = useState(null)
  const [loading, setLoading]  = useState(false)

  /** 시작일과 종료일이 같으면 시간별 집계로 처리 */
  const isDaily = rangeType === 'daily' || startDate === endDate

  /** 날씨 조회 (10분마다 자동 갱신) */
  useEffect(() => {
    const fetchWeather = () => {
      getCurrentWeather()
        .then(setWeather)
        .catch(err => console.error('[날씨] 조회 실패', err))
    }

    fetchWeather() // 마운트 시 즉시 호출

    const timer = setInterval(fetchWeather, 10 * 60 * 1000) // 10분마다 갱신
    return () => clearInterval(timer) // 언마운트 시 정리
  }, [])

  /** 센서 이력 조회 */
  const fetchHistory = async (start = startDate, end = endDate) => {
    setLoading(true)
    try {
      const data = await getSensorHistory(start, end)
      setHistory(data)
    } catch (err) {
      console.error('[센서 이력] 조회 실패', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  /** 오늘 탭: 10분마다 자동 갱신 */
  useEffect(() => {
    if (!isDaily) return

    const timer = setInterval(() => {
      fetchHistory(startDate, endDate)
    }, 10 * 60 * 1000) // 10분 = 600,000ms

    return () => clearInterval(timer)
  }, [isDaily, startDate, endDate])

  /** 빠른 날짜 선택 핸들러 */
  const handleQuickRange = ({ label, type }) => {
    const currentYear = new Date().getFullYear()
    let start, end = today()

    if (type === 'daily') {
      start = today()
    } else if (type === 'weekly') {
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      start = `${now.getFullYear()}-${mm}-01`  // 이번 달 1일부터
    } else if (type === 'monthly') {
      start = `${currentYear}-01-01`  // 올해 1월 1일
    } else if (type === 'yearly') {
      start = `${currentYear - 5}-01-01`  // 올해 연도 - 5
    }

    setStartDate(start)
    setEndDate(end)
    setActiveRange(label)
    setRangeType(type)
    fetchHistory(start, end)
  }

  /** 수동 날짜 변경 핸들러 */
  const handleDateChange = (type, value) => {
    setActiveRange(null)
    setRangeType('custom')
    if (type === 'start') setStartDate(value)
    else setEndDate(value)
  }

  /** 탭별 차트 데이터 집계 */
  const getChartData = (key) => {
    if (!history) return []

    let rawData = [], valueKey = ''

    if (key === 'temperature' || key === 'humidity') {
      rawData = history.dht;  valueKey = key
    } else if (key === 'light') {
      rawData = history.light; valueKey = 'lightValue'
    } else if (key === 'air') {
      rawData = history.air;   valueKey = 'rawValue'
    }

    if (rangeType === 'yearly')  return aggregateByYear(rawData, valueKey, startDate, endDate)
    if (rangeType === 'monthly') return aggregateByMonth(rawData, valueKey, startDate, endDate)
    if (rangeType === 'weekly') return aggregateByWeek(rawData, valueKey, endDate)
    if (isDaily) return aggregateByHour(rawData, valueKey, startDate)

    // 수동 날짜 선택 시 범위에 따라 자동 집계
    const dayDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    if (dayDiff > 365) return aggregateByYear(rawData, valueKey, startDate, endDate)
    if (dayDiff > 60)  return aggregateByMonth(rawData, valueKey, startDate, endDate)
    return aggregateByDay(rawData, valueKey, startDate, endDate)
  }

  return (
    <div className={styles.container}>
      <PageTitle title='센서 데이터 분석' />

      {/* 날씨 카드 */}
      <WeatherCard weather={weather} />

      {/* 필터 탭 */}
      <SensorFilterBar 
        QUICK_RANGES={QUICK_RANGES}
        TABS={TABS}
        activeRange={activeRange}
        activeTab={activeTab}
        startDate={startDate}
        endDate={endDate}
        todayStr={todayStr}
        onQuickRange={handleQuickRange}
        onDateChange={handleDateChange}
        onSearch={() => fetchHistory()}
        onTabChange={setActiveTab}
      />

      {/* 차트 영역 */}
      <div className={styles.chartWrap}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : activeTab === 'all' ? (
          <SensorAllGrid 
            TABS={TABS}
            getChartData={getChartData}
            rangeType={rangeType}
            isDaily={isDaily}
          />
        ) : (
          <SensorAreaChart 
            tab={TABS.find(t => t.key === activeTab)}
            data={getChartData(activeTab)}
            rangeType={rangeType}
            isDaily={isDaily}
          />
        )}
      </div>
    </div>
  )
}

export default SensorChart
