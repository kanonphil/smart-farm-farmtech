import React, { useEffect, useState } from 'react'
import { getSensor } from '../../api/mamagerApi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  // 조회한 센서 data 저장 state 변수
  const [sensorData, setSensorData] = useState(null)

  // 마운트 시 센서 data 조회할 함수
  const getSensorData = async () => {
    const response = await getSensor();
    setSensorData(response.data)
  }

  const chartData = sensorData?.dht?.map((item) => ({
    time : item.recordedAt.slice(11,19), // "00:00:00"
    temperature : item.temperature,
    humidity : item.humidity
  })).reverse() ?? []

  console.log(sensorData)

  // 마운트 시 실행 함수
  useEffect(()=>{getSensorData()}, [])
  return (
    <div>
      <div>
        <AreaChart
          width={700}
          height={400}
          data={chartData}
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
            tick={{ fontSize : 12 }}
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
      <div>
        
      </div>
    </div>
  )
}

export default Dashboard