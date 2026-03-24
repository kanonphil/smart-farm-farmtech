import styles from './PageTitle.module.css'

const PageTitle = ({ title }) => {
  return <h2 className={styles.title}>{title}</h2>
}

export default PageTitle