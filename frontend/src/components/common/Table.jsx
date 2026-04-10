import styles from './Table.module.css'

/**
 * 공통 테이블 컴포넌트
 * @param {Array}    headers      - 헤더 행 배열 (2D: [[{label, colSpan, rowSpan, style}]])
 * @param {Array}    data         - 데이터 배열
 * @param {Function} renderRow    - 행 렌더 함수 (item, index) => <td>...</td>
 * @param {Function} getRowClass  - 행별 CSS 클래스 반환 함수 (item) => string (선택)
 * @param {string}   emptyMessage - 데이터 없을 때 표시 메시지 (선택)
 */
const Table = ({
  headers,
  data = [],
  renderRow,
  getRowClass,
  emptyMessage = '데이터가 없습니다.',
}) => {
  /** 빈 상태 colSpan: 첫 번째 헤더 행의 총 컬럼 수 */
  const totalCols = headers[0]?.reduce((sum, col) => sum + (col.colSpan || 1), 0) || 1

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          {headers.map((headerRow, i) => (
            <tr key={i}>
              {headerRow.map((col, j) => (
                <th key={j} rowSpan={col.rowSpan || 1} colSpan={col.colSpan || 1} style={col.style || {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className={styles.empty}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className={getRowClass ? getRowClass(item) : ''}>
                {renderRow(item, index, data.length)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
