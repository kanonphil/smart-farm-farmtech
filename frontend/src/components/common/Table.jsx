import styles from './Table.module.css'

const Table = ({ headers, data = [], renderRow }) => {
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
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? styles.even : styles.odd}>
              {renderRow(item, index, data.length)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table