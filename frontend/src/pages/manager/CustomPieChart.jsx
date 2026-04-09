import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ORDER_STATUS = [
  { name: '결제완료', key: 'paidCount',    color: '#fef9c3' },
  { name: '배송완료', key: 'shippedCount', color: '#dbeafe' },
  { name: '구매확정', key: 'doneCount',    color: '#dcfce7' },
  { name: '구매취소', key: 'cancelCount',  color: '#fee2e2' },
]

const CustomPieChart = ({ data }) => {

  // ✅ 컴포넌트 안, return 밖에서 선언
  const chartData = ORDER_STATUS.map(s => ({
    name: s.name,
    value: data?.[s.key] ?? 0,
    color: s.color,
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1e293b', borderRadius: '8px',
          padding: '10px 14px', color: '#fff', fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <p style={{ color: '#94a3b8', marginBottom: 4 }}>{payload[0].name}</p>
          <p style={{ fontWeight: 700 }}>{payload[0].value}건</p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: 2,
            background: entry.color,
            border: '1px solid rgba(0,0,0,0.1)',
            flexShrink: 0
          }}/>
          <span style={{ color: '#64748b' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={85} outerRadius={120}
            paddingAngle={3} dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke={entry.color} strokeWidth={1} />
            ))}
          </Pie>
          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#94a3b8">
            총 주문
          </text>
          <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle" fontSize={22} fontWeight={700} fill="#0f172a">
            {total}건
          </text>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomPieChart
