import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts'

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#fff',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <p style={{ marginBottom: 4, color: '#94a3b8' }}>{label}</p>
        <p style={{ fontWeight: 700 }}>매출: {payload[0].value.toLocaleString()}원</p>
      </div>
    )
  }
  return null
}

// 막대 위 라벨
const renderCustomizedLabel = ({ x, y, width, value }) => {
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="#94a3b8">
      {value >= 10000 ? `${(value / 10000).toFixed(0)}만` : value.toLocaleString()}
    </text>
  )
}

const CustomBarChart = ({ data }) => {
  // 가장 높은 달 강조
  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={true}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => v === 0 ? '0' : `${(v / 10000).toFixed(0)}만`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={true}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} minPointSize={3}>
          <LabelList dataKey="revenue" content={renderCustomizedLabel} />
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.revenue === maxRevenue ? '#38bdf8' : '#bfdbfe'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomBarChart
