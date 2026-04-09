import { useEffect, useState } from 'react'
import { getAlerts } from '../../api/managerApi'
import PageTitle from '../../components/common/PageTitle'
import Table from '../../components/common/Table'
import styles from './AlertHistory.module.css'

// 센서 타입 한글 변환
const SENSOR_LABEL = {
  temperature: '온도',
  humidity: '습도',
  air: '대기질',
  lux: '조도',
}

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([])

  const fetchAlerts = async () => {
    const response = await getAlerts()
    if (response) setAlerts(response)
  }

  useEffect(() => {
    fetchAlerts()
    // 30초마다 갱신
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const headers = [[
    { label: '센서', styles: { width: '15%' } },
    { label: '이탈 방향', styles: { width: '15%' } },
    { label: '측정값', styles: { width: '20%' }  },
    { label: '임계값', styles: { width: '20%' }  },
    { label: '발생 시각', styles: { width: '30%' }  },
  ]]

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <PageTitle title='Alert History' />
  
        <Table
          headers={headers}
          data={alerts}
          renderRow={(alert) => (
            <>
            {/* 센서 종류 뱃지 */}
              <td>
                <span className={styles.sensorBadge}>
                  {SENSOR_LABEL[alert.sensorType] ?? alert.sensorType}
                </span>
              </td>
  
              {/* 하한 이탈 / 상한 초과 뱃지 */}
              <td>
                {alert.thresholdType === 'LOW' ? (
                  <span className={`${styles.typeBadge} ${styles.typeLow}`}>
                    하한 이탈
                  </span>
                ) : alert.thresholdType === 'HIGH' ? (
                  <span className={`${styles.typeBadge} ${styles.typeHigh}`}>
                    상한 초과
                  </span>
                ) : (
                  <span className={styles.typeBadge}>-</span>
                )}
              </td>
              <td className={styles.valueCell}>{alert.value}</td>
              <td className={styles.thresholdCell}>{alert.threshold}</td>
              <td className={styles.timeCell}>{alert.createdAt?.replace('T', ' ').slice(0, 19)}</td>
            </>
          )}
        />
      </div>
    </div>
  )
}

export default AlertHistory
