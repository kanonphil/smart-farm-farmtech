import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import styles from './SensorAreaChart.module.css'

/**
 * 단일 센서 AreaChart
 * @param {{ tab, data, rangeType, isDaily, height }} props
 */
const SensorAreaChart = ({ tab, data, rangeType, isDaily, height = 360 }) => {
  const gradientId   = `grad-${tab.key}`
  const isHorizontal = ['yearly', 'monthly', 'weekly', 'daily', 'custom'].includes(rangeType) || isDaily

  if (data.length === 0) {
    return <div className={styles.empty}>데이터 없음</div>
  }

  return (
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
          formatter={value => [`${value}${tab.unit}`, tab.label]}
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

export default SensorAreaChart
