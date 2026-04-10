import styles from './WeatherCard.module.css'

/**
 * 현재 날씨 카드
 * @param {{ weather: object|null }} props
 */
const WeatherCard = ({ weather }) => {
  if (!weather) return null

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
          className={styles.icon}
        />
        <div>
          <p className={styles.city}>{weather.name}</p>
          <p className={styles.desc}>{weather.weather[0].description}</p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.item}>
          <span className={styles.label}>기온</span>
          <span className={styles.value}>{weather.main.temp.toFixed(1)}°C</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>체감</span>
          <span className={styles.value}>{weather.main.feels_like.toFixed(1)}°C</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>습도</span>
          <span className={styles.value}>{weather.main.humidity}%</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>풍속</span>
          <span className={styles.value}>{weather.wind.speed}m/s</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard
