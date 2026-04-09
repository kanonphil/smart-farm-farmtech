
/**
 * OpenWeatherMap 현재 날씨 조회
 * 위치는 필요에 따라 수정 (현재 기본값: Seoul)
 */
export const getCurrentWeather = async () => {
  const key = import.meta.env.VITE_WEATHER_API_KEY
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${key}&lang=ko&units=metric`
  )
  return response.json()
}