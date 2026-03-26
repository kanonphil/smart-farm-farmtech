import React, { useEffect, useState } from 'react'
import { getSensor } from '../../api/mamagerApi'
import TemperatureAreaChart from './TemperatureAreaChart';
import HumidityPieChart from './HumidityPieChart';

const Dashboard = () => {
  // 조회한 센서 data 저장 state 변수
  const [sensorData, setSensorData] = useState(null)

  // 마운트 시 센서 data 조회할 함수
  const getSensorData = async () => {
    const response = await getSensor();
    setSensorData(response.data)
  }

  // 온도 차트 데이터
  const temperatureChartData = sensorData?.dht?.map((item) => ({
    time : item.recordedAt.slice(11,19), // "00:00:00"
    temperature : item.temperature,
  })).reverse() ?? []

  // 습도 차트 데이터
  const humidityChartData = [
    { name : '현재습도', value : sensorData?.dht?.[0]?.humidity ?? 0},
    { name : '', value : 100 - (sensorData?.dht?.[0]?.humidity ?? 0)}
  ]


  // 마운트 시 실행 함수
  useEffect(()=>{
    getSensorData()
    //3초에 한번씩 데이터 조회
    const interval = setInterval(getSensorData, 3000)
    // 페이지 벗어날 때 interval 정리 (메모리 누수 방지)
    return () => clearInterval(interval)
  }, [])
  return (
    <div>
      <div>
        <TemperatureAreaChart data={temperatureChartData}/>
      </div>
      <div>
        <HumidityPieChart data={humidityChartData}/>
      </div>
    </div>
  )
}

export default Dashboard