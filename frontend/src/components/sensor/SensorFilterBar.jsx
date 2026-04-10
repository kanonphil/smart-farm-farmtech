import styles from './SensorFilterBar.module.css'

/**
 * 빠른 날짜 선택 + 날짜 직접 입력 + 센서 탭
 * @param {{ QUICK_RANGES, TABS, activeRange, activeTab, startDate, endDate, todayStr,
 *           onQuickRange, onDateChange, onSearch, onTabChange }} props
 */
const SensorFilterBar = ({
  QUICK_RANGES, TABS,
  activeRange, activeTab,
  startDate, endDate, todayStr,
  onQuickRange, onDateChange, onSearch, onTabChange,
}) => (
  <>
    {/* 빠른 날짜 선택 */}
    <div className={styles.quickRow}>
      {QUICK_RANGES.map(range => (
        <button
          key={range.label}
          className={`${styles.quickBtn} ${activeRange === range.label ? styles.quickBtnActive : ''}`}
          onClick={() => onQuickRange(range)}
        >
          {range.label}
        </button>
      ))}
    </div>

    {/* 날짜 직접 입력 */}
    <div className={styles.filterRow}>
      <input
        type='date'
        className={styles.dateInput}
        value={startDate}
        max={endDate}
        onChange={e => onDateChange('start', e.target.value)}
      />
      <span className={styles.dateSep}>~</span>
      <input
        type='date'
        className={styles.dateInput}
        value={endDate}
        min={startDate}
        max={todayStr}
        onChange={e => onDateChange('end', e.target.value)}
      />
      <button className={styles.searchBtn} onClick={onSearch}>조회</button>
    </div>

    {/* 센서 탭 */}
    <div className={styles.tabRow}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
          style={activeTab === tab.key ? { borderColor: tab.color, color: tab.color } : {}}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </>
)

export default SensorFilterBar
