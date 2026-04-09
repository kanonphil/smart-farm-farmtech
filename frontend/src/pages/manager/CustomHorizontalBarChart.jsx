import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{payload[0].payload.name}</p>
      <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{payload[0].value.toLocaleString()}개</p>
    </div>
  )
}



const COLORS = ['#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c4b5fd']

const RANK_COLORS = ['#fbbf24', '#94a3b8', '#fb923c', '#64748b', '#64748b']

const CustomYAxisTick = ({ x, y, payload, index }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* 순위 번호 */}
      <text
        x={-100} y={0} dy={4}
        textAnchor="middle"
        fill={RANK_COLORS[index]}
        fontSize={13}
        fontWeight={700}
      >
        {index + 1}
      </text>
      {/* 상품명 */}
      <text
        x={-82} y={0} dy={4}
        textAnchor="start"
        fill="#475569"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  )
}


const CustomHorizontalBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 60, left: 0, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={<CustomYAxisTick/>}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        <Bar dataKey="totalQty" radius={[0, 6, 6, 0]} barSize={14}>
          <LabelList
            dataKey="totalQty"
            position="right"
            formatter={(v) => `${v.toLocaleString()}개`}
            style={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
          />
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomHorizontalBarChart
