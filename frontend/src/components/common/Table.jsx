import styles from './Table.module.css'

const Table = ({ headers, data = [], renderRow }) => {
  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        {headers.map((headerRow, i) => (
          <tr key={i}>
            {headerRow.map((col, j) => (
              <th key={j} rowSpan={col.rowSpan || 1} colSpan={col.colSpan || 1}>
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
  )
}

export default Table