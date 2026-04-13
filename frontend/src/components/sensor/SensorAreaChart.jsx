import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  Line,
  Legend,
} from 'recharts'
import styles from './SensorAreaChart.module.css'

/**
 * 단일 센서 AreaChart (평균 + 최고/최저 라인)
 * @param {{ tab, data, rangeType, isDaily, height }} props
 */
const SensorAreaChart = ({ tab, data, rangeType, isDaily, height = 360 }) => {
  const gradientId   = `grad-${tab.key}`
  const isHorizontal = ['yearly', 'monthly', 'weekly', 'daily', 'custom'].includes(rangeType) || isDaily

  /** 요약 통계 계산 */
  const validData = data.filter(d => d.value !== 0)
  const avgValue = validData.length
    ? (validData.reduce((s, d) => s + d.value, 0) / validData.length).toFixed(1)
    : '-'
  const maxValue = validData.length ? Math.max(...validData.map(d => d.max)).toFixed(1) : '-'
  const minValue = validData.length ? Math.min(...validData.map(d => d.min)).toFixed(1) : '-'
  
  if (data.length === 0) {
    return <div className={styles.empty}>데이터 없음</div>
  }

  return (
    <div>
      {/* 요약 카드 */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>평균</span>
          <span className={styles.statValue} style={{ color: tab.color }}>
            {avgValue}{tab.unit}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>최고</span>
          <span className={styles.statValue} style={{ color: '#ef4444' }}>
            {maxValue}{tab.unit}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>최저</span>
          <span className={styles.statValue} style={{ color: '#3b82f6' }}>
            {minValue}{tab.unit}
          </span>
        </div>
      </div>

      {/* 차트 */}
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: isHorizontal ? 10 : 50 }}
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
            angle={isHorizontal ? 0 : -30}
            textAnchor={isHorizontal ? 'middle' : 'end'}
            interval={isDaily ? 1 : 'preserveStartEnd'}
          />
          <YAxis tick={{ fontSize: 11, fill: '#999' }} unit={tab.unit} />
          <Tooltip
            formatter={(value, name) => {
              const labelMap = { value: '평균', max: '최고', min: '최저' }
              return [`${value}${tab.unit}`, labelMap[name] ?? name]
            }}
            labelStyle={{ fontSize: 11 }}
          />
          <Legend
            formatter={(value) => ({ value: '평균', max: '최고', min: '최저' }[value] ?? value)}
          />
          {/* 평균 면적 */}
          <Area
            type='monotone'
            dataKey='value'
            stroke={tab.color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
          />
          {/* 최고 라인 */}
          <Line
            type='monotone'
            dataKey='max'
            stroke='#ef4444'
            strokeWidth={1.5}
            strokeDasharray='4 3'
            dot={false}
          />
          {/* 최저 라인 */}
          <Line
            type='monotone'
            dataKey='min'
            stroke='#3b82f6'
            strokeWidth={1.5}
            strokeDasharray='4 3'
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SensorAreaChart
