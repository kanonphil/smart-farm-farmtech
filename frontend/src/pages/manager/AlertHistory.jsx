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
    { label: '센서', styles: { width: '20%' } },
    { label: '측정값', styles: { width: '20%' }  },
    { label: '임계값', styles: { width: '20%' }  },
    { label: '발생 시각', styles: { width: '20%' }  },
  ]]

  return (
    <div className={styles.container}>
      <PageTitle title='Alert History' />

      <Table
        headers={headers}
        data={alerts}
        renderRow={(alert) => (
          <>
            <td>
              <span className={styles.sensorBadge}>
                {SENSOR_LABEL[alert.sensorType] ?? alert.sensorType}
              </span>
            </td>
            <td className={styles.valueCell}>{alert.value}</td>
            <td className={styles.thresholdCell}>{alert.threshold}</td>
            <td className={styles.timeCell}>{alert.createdAt?.replace('T', ' ').slice(0, 19)}</td>
          </>
        )}
      />
    </div>
  )
}

export default AlertHistory
