import SensorAreaChart from './SensorAreaChart'
import styles from './SensorAllGrid.module.css'

/**
 * 전체 탭 - 2x2 미니 차트 그리드
 * @param {{ TABS, getChartData, rangeType, isDaily }} props
 */
const SensorAllGrid = ({ TABS, getChartData, rangeType, isDaily }) => (
  <div className={styles.grid}>
    {TABS.filter(t => t.key !== 'all').map(tab => (
      <div key={tab.key} className={styles.item}>
        <p className={styles.title} style={{ color: tab.color }}>
          {tab.label} ({tab.unit})
        </p>
        <SensorAreaChart
          tab={tab}
          data={getChartData(tab.key)}
          rangeType={rangeType}
          isDaily={isDaily}
          height={200}
        />
      </div>
    ))}
  </div>
)

export default SensorAllGrid
