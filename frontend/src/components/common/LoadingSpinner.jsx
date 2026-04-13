import styles from './LoadingSpinner.module.css'

/**
 * 공통 로딩 스피너 컴포넌트
 * 데이터 로딩 대기 시 전체 영역 중앙에 표시
 */
const LoadingSpinner = () => (
  <div className={styles.loadingWrap}>
    <div className={styles.spinner} />
  </div>
)

export default LoadingSpinner
