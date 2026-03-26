import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TemperatureAreaChart = ({ data }) => {
  return (
    <div>
      <AreaChart
        width={700}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
      >
        <defs>
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset='5%' stopColor='#00BCD4' stopOpacity={0.4}/>
            <stop offset='95%' stopColor='#00BCD4' stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e0e0e0"
          vertical={true}
        />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize : 11 }}
          tickMargin={10}
        />
        <YAxis
          domain={[
            (dataMin) => dataMin - 0.5,
            (dataMax) => dataMax + 0.5,
          ]}
          unit="°C"
          tick={{ fontSize : 12 }}
          tickMargin={10}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor : '#fff',
            border : '1px solid #00BCD4',
            borderRadius : '8px',
            fontSize : '13px'
          }}
          formatter={(value) => [`${value}°C`, '온도']} 
        />
        <Legend align='center'/>
        <Area
          type="monotone"
          dataKey="temperature"
          name=" 온도"
          stroke="#00BCD4"
          fill="url(#tempGradient)"
          dot={{ r: 3, fill: '#00BCD4', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#00BCD4' }}
        />
      </AreaChart>
    </div>
  )
}

export default TemperatureAreaChart