import { Pie, PieChart, Sector } from 'recharts';
import React from 'react'

const HumidityPieChart = ({ data }) => {

  // 각도 계산할 때 쓰는 상수 (라디안 변환용, 건드릴 필요 없음)
  const RADIAN = Math.PI / 180;

  // 각 조각 색상 배열 (순서대로 적용됨)
  const COLORS = ['#00BCD4', '#E0F7FA'];

    
  // 파이 조각 안에 % 텍스트 그리는 함수
  // 일단 지금 안쓰는중 !!
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (name !== '현재습도') return null
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
      return null;
    }
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      // 계산한 위치에 퍼센트 텍스트 출력
      <text textAnchor="middle" dominantBaseline="central">
        <tspan x={x} y={y - 10} fill="white" fontSize={13}>습도</tspan>
        <tspan x={x} y={y + 10} fill="white" fontSize={13}>{`${(percent * 100).toFixed(1)}%`}</tspan>
      </text>
    );
  };

  // 각 조각을 커스텀 색상으로 그리는 컴포넌트
  // props.index = 몇 번째 조각인지 → COLORS 배열에서 색 꺼냄
  const MyCustomPie = (props) => {
    return <Sector {...props} fill={COLORS[props.index % COLORS.length]} />;
  };




  return (
    <div>
      <PieChart width={400} height={400}>
        <Pie
          innerRadius={70} outerRadius={110}
          data={data}              // 위에서 만든 데이터
          label={false}
          labelLine={false}
          fill="#8884d8"           // 기본 색 (MyCustomPie가 덮어씀)
          dataKey="value"          // data 객체에서 값으로 쓸 키
          isAnimationActive={true}  // 애니메이션 여부
          shape={MyCustomPie}      // 커스텀 조각 모양 적용
        />
        <text x={200} y={190} textAnchor="middle" fill="#00BCD4" fontSize={28} fontWeight="bold">
          {data[0]?.value?.toFixed(1)}%
        </text>
        <text x={200} y={220} textAnchor="middle" fill="#999" fontSize={14}>
          현재 습도
        </text>
      </PieChart>
    </div>
  )
}

export default HumidityPieChart