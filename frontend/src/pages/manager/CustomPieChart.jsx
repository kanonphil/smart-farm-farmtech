import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * 주문 상태 항목 정의
 * key: DashboardDTO 필드명
 * 백엔드 상태값: PAID · SHIPPING(배송중) · SHIPPED(배송완료) · DONE · CANCEL
 */
const ORDER_STATUS = [
  { name: '결제완료', key: 'paidCount',     color: '#fef9c3', stroke: '#ca8a04' },
  { name: '배송중',   key: 'shippingCount', color: '#ffedd5', stroke: '#ea580c' },
  { name: '배송완료', key: 'shippedCount',  color: '#dbeafe', stroke: '#2563eb' },
  { name: '구매확정', key: 'doneCount',     color: '#dcfce7', stroke: '#16a34a' },
  { name: '구매취소', key: 'cancelCount',   color: '#fee2e2', stroke: '#dc264a' },
]

/** 파이 차트 커스텀 툴팁 (컴포넌트 외부 선언 — render 중 생성 방지) */
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

/** 파이 차트 커스텀 범례 (컴포넌트 외부 선언 — render 중 생성 방지) */
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

const CustomPieChart = ({ data }) => {

  // 주문 상태별 차트 데이터 가공 (없는 항목은 0으로 채움)
  const chartData = ORDER_STATUS.map(s => ({
    name: s.name,
    value: data?.[s.key] ?? 0,
    color: s.color,
    stroke: s.stroke,
  }))

  // 총 주문 건수 (도넛 중앙 표시용)
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

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
              <Cell key={i} fill={entry.color} stroke={entry.stroke} strokeWidth={1} />
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
