import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { getSensorHistory } from '../../api/managerApi'
import { getCurrentWeather } from '../../api/weatherApi'
import PageTitle from '../../components/common/PageTitle'
import styles from './SensorChart.module.css'

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

const formatDate = (date) => date.toISOString().slice(0, 10)
const today = () => formatDate(new Date())
const daysAgo = (n) => {
  const d = new Date()
  d.setTime(d.getTime() - n * 24 * 60 * 60 * 1000)
  return formatDate(d)
}

/** 연도별 평균 집계 */
const aggregateByYear = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const year = d.recordedAt?.slice(0, 4)
    if (!year) return
    if (!grouped[year]) grouped[year] = { sum: 0, count: 0 }
    grouped[year].sum += d[valueKey] ?? 0
    grouped[year].count += 1
  })

  const startYear = parseInt(startDate.slice(0, 4))
  const endYear = parseInt(endDate.slice(0, 4))
  const result = []
  
  for (let y = startYear; y <= endYear; y++) {
    const key = String(y)
    result.push({
      time:  `${y}년`,
      value: grouped[key]
        ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        : 0,
    })
  }
  return result
}

/** 월별 평균 집계 */
const aggregateByMonth = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const month = d.recordedAt?.slice(0, 7) // YYYY-MM
    if (!month) return
    if (!grouped[month]) grouped[month] = { sum: 0, count: 0 }
    grouped[month].sum   += d[valueKey] ?? 0
    grouped[month].count += 1
  })

  const [sy, sm] = startDate.slice(0, 7).split('-').map(Number)
  const [ey, em] = endDate.slice(0, 7).split('-').map(Number)
  const result   = []

  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    result.push({
      time:  `${m}월`,
      value: grouped[key]
        ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        : 0,
    })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return result
}

/** 일별 평균  */
const aggregateByDay = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const day = d.recordedAt?.slice(0, 10) // YYYY-MM-DD
    if (!day) return
    if (!grouped[day]) grouped[day] = { sum: 0, count: 0 }
    grouped[day].sum   += d[valueKey] ?? 0
    grouped[day].count += 1
  })

  const result = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const key = formatDate(current)
    result.push({
      time:  key.slice(5).replace('-', '/'), // MM/DD
      value: grouped[key]
        ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        : 0,
    })
    current.setDate(current.getDate() + 1)
  }
  return result
}

/** 시간별 평균 집계 (오늘이면 현재 시각까지, 과거 날짜면 23시까지) */
const aggregateByHour = (data, valueKey, targetDate) => {
  const grouped = {}
  data.forEach(d => {
    const hour = d.recordedAt?.slice(11, 13) // "HH"
    if (!hour) return
    if (!grouped[hour]) grouped[hour] = { sum: 0, count: 0 }
    grouped[hour].sum   += d[valueKey] ?? 0
    grouped[hour].count += 1
  })

  // 오늘이면 현재 시각까지만, 과거 날짜면 23시까지
  const isToday = targetDate === formatDate(new Date())
  const maxHour = isToday ? new Date().getHours() : 23

  const result = []
  for (let h = 0; h <= maxHour; h++) {
    const key = String(h).padStart(2, '0')
    result.push({
      time:  `${h}시`,
      value: grouped[key]
        ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        : 0,
    })
  }
  return result
}

/**
 * 센서 데이터 분석 페이지
 */
const SensorChart = () => {
  const [startDate, setStartDate]  = useState(daysAgo(7))
  const [endDate, setEndDate]  = useState(today())
  const [activeTab, setActiveTab]  = useState('all')
  const [activeRange, setActiveRange] = useState('주간')
  const [rangeType, setRangeType]  = useState('weekly')
  const [history, setHistory]  = useState(null)
  const [weather, setWeather]  = useState(null)
  const [loading, setLoading]  = useState(false)
  /** 시작일과 종료일이 같으면 시간별 집계로 처리 */
  const isDaily = rangeType === 'daily' || startDate === endDate

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

  /** 오늘 데이터 조회 시 10분마다 자동 갱신 */
  useEffect(() => {
    if (!isDaily) return

    const timer = setInterval(() => {
      fetchHistory(startDate, endDate)
    }, 10 * 60 * 1000) // 10분 = 600,000ms

    return () => clearInterval(timer)
  }, [isDaily, startDate, endDate])

  /** 빠른 날짜 선택 */
  const handleQuickRange = ({ label, type, days }) => {
    const currentYear = new Date().getFullYear()
    let start, end = today()

    if (type === 'daily') {
      start = today()
    } else if (type === 'weekly') {
      start = daysAgo(days)
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

  /** 수동 날짜 변경 시 빠른 선택 해제 */
  const handleDateChange = (type, value) => {
    setActiveRange(null)
    setRangeType('weekly')
    if (type === 'start') setStartDate(value)
    else setEndDate(value)
  }

  /** 탭별 차트 데이터 가공 + 집계 */
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
    if (isDaily) return aggregateByHour(rawData, valueKey, startDate)
    return aggregateByDay(rawData, valueKey, startDate, endDate)  // weekly
  }

  const currentTab = TABS.find(t => t.key === activeTab)

  const renderChart = (tab, height = 360) => {
    const data       = getChartData(tab.key)
    const gradientId = `grad-${tab.key}`

    if (data.length === 0) {
      return <div className={styles.empty}>데이터 없음</div>
    }

    return (
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart 
          data={data} 
          margin={{ 
            top: 10, 
            right: 20, 
            left: 0, 
            bottom: 10
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%'  stopColor={tab.color} stopOpacity={0.4} />
              <stop offset='95%' stopColor={tab.color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
          <XAxis
            dataKey='time'
            tick={{ fontSize: 11, fill: '#999' }}
            angle={['yearly', 'monthly'].includes(rangeType) || isDaily ? 0 : -30}
            textAnchor={['yearly', 'monthly'].includes(rangeType) || isDaily ? 'middle' : 'end'}
            interval={isDaily ? 1 : 'preserveStartEnd'}
          />
          <YAxis tick={{ fontSize: 11, fill: '#999' }} unit={tab.unit} />
          <Tooltip
            formatter={(value) => [`${value}${tab.unit}`, tab.label]}
            labelStyle={{ fontSize: 11 }}
          />
          <Area
            type='monotone'
            dataKey='value'
            stroke={tab.color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className={styles.container}>
      <PageTitle title='센서 데이터 분석' />

      {/* 날씨 카드 */}
      {weather && (
        <div className={styles.weatherCard}>
          <div className={styles.weatherLeft}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className={styles.weatherIcon}
            />
            <div>
              <p className={styles.weatherCity}>{weather.name}</p>
              <p className={styles.weatherDesc}>{weather.weather[0].description}</p>
            </div>
          </div>
          <div className={styles.weatherRight}>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>기온</span>
              <span className={styles.weatherValue}>{weather.main.temp.toFixed(1)}°C</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>체감</span>
              <span className={styles.weatherValue}>{weather.main.feels_like.toFixed(1)}°C</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>습도</span>
              <span className={styles.weatherValue}>{weather.main.humidity}%</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.weatherLabel}>풍속</span>
              <span className={styles.weatherValue}>{weather.wind.speed}m/s</span>
            </div>
          </div>
        </div>
      )}

      {/* 빠른 날짜 선택 */}
      <div className={styles.quickRow}>
        {QUICK_RANGES.map((range) => (
          <button
            key={range.label}
            className={`${styles.quickBtn} ${activeRange === range.label ? styles.quickBtnActive : ''}`}
            onClick={() => handleQuickRange(range)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* 날짜 필터 */}
      <div className={styles.filterRow}>
        <input
          type='date'
          className={styles.dateInput}
          value={startDate}
          max={endDate}
          onChange={e => handleDateChange('start', e.target.value)}
        />
        <span className={styles.dateSep}>~</span>
        <input
          type='date'
          className={styles.dateInput}
          value={endDate}
          min={startDate}
          max={today()}
          onChange={e => handleDateChange('end', e.target.value)}
        />
        <button className={styles.searchBtn} onClick={() => fetchHistory()}>
          조회
        </button>
      </div>

      {/* 센서 탭 */}
      <div className={styles.tabRow}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            style={activeTab === tab.key ? { borderColor: tab.color, color: tab.color } : {}}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className={styles.chartWrap}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : activeTab === 'all' ? (
          <div className={styles.allGrid}>
            {TABS.filter(t => t.key !== 'all').map(tab => (
              <div key={tab.key} className={styles.miniChart}>
                <p className={styles.miniTitle} style={{ color: tab.color }}>
                  {tab.label} ({tab.unit})
                </p>
                {renderChart(tab, 200)}
              </div>
            ))}
          </div>
        ) : (
          renderChart(currentTab)
        )}
      </div>
    </div>
  )
}

export default SensorChart
