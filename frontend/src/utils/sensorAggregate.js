/** 날짜를 YYYY-MM-DD 문자열로 변환 */
export const formatDate = (date) => date.toISOString().slice(0, 10)

/** 오늘 날짜 (YYYY-MM-DD) */
export const today = () => formatDate(new Date())

/**
 * N일 전 날짜 반환
 * @param {number} n
 */
export const daysAgo = (n) => {
  const d = new Date()
  d.setTime(d.getTime() - n * 24 * 60 * 60 * 1000)
  return formatDate(d)
}

/**
 * 연도별 평균/최고/최저 집계
 * @param {Array} data @param {string} valueKey
 * @param {string} startDate @param {string} endDate
 */
export const aggregateByYear = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const year = d.recordedAt?.slice(0, 4)
    if (!year) return
    if (!grouped[year]) grouped[year] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
    const v = d[valueKey] ?? 0
    grouped[year].sum += v
    grouped[year].count += 1
    grouped[year].min = Math.min(grouped[year].min, v)
    grouped[year].max = Math.max(grouped[year].max, v)
  })
  const startYear = parseInt(startDate.slice(0, 4))
  const endYear   = parseInt(endDate.slice(0, 4))
  const result = []
  for (let y = startYear; y <= endYear; y++) {
    const key = String(y)
    result.push({
      time:  `${y}년`,
      value: grouped[key] ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1)) : 0,
      min: grouped[key] ? parseFloat(grouped[key].min.toFixed(1)) : 0,
      max: grouped[key] ? parseFloat(grouped[key].max.toFixed(1)) : 0,
    })
  }
  return result
}

/**
 * 월별 평균/최고/최저 집계 (올해 1월~12월)
 * @param {Array} data @param {string} valueKey
 * @param {string} startDate @param {string} endDate
 */
export const aggregateByMonth = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const month = d.recordedAt?.slice(0, 7)
    if (!month) return
    if (!grouped[month]) grouped[month] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
    const v = d[valueKey] ?? 0
    grouped[month].sum += v
    grouped[month].count += 1
    grouped[month].min = Math.min(grouped[month].min, v)
    grouped[month].max = Math.max(grouped[month].max, v)
  })
  const [sy, sm] = startDate.slice(0, 7).split('-').map(Number)
  const [ey, em] = endDate.slice(0, 7).split('-').map(Number)
  const result = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    result.push({
      time:  `${m}월`,
      value: grouped[key] ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1)) : 0,
      min: grouped[key] ? parseFloat(grouped[key].min.toFixed(1)) : 0,
      max: grouped[key] ? parseFloat(grouped[key].max.toFixed(1)) : 0,
    })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return result
}

/**
 * 주차별 평균/최고/최저 집계 (해당 월의 1주차~N주차)
 * 1주차: 1~7일, 2주차: 8~14일, 3주차: 15~21일, 4주차: 22~28일, 5주차: 29~31일
 * @param {Array} data @param {string} valueKey @param {string} endDate
 */
export const aggregateByWeek = (data, valueKey, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const day = parseInt(d.recordedAt?.slice(8, 10))
    if (!day) return
    const week = Math.ceil(day / 7)
    if (!grouped[week]) grouped[week] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
    const v = d[valueKey] ?? 0
    grouped[week].sum += v
    grouped[week].count += 1
    grouped[week].min = Math.min(grouped[week].min, v)
    grouped[week].max = Math.max(grouped[week].max, v)
  })

  const endDateObj = new Date(endDate)
  const month = endDateObj.getMonth()
  const lastDay = new Date(endDateObj.getFullYear(), month + 1, 0).getDate()
  const currentDay = parseInt(endDate.slice(8, 10))
  const maxWeek = Math.ceil(currentDay / 7)
  const m = month + 1
  
  const result  = []
  for (let w = 1; w <= maxWeek; w++) {
    const wStart = (w - 1) * 7 + 1
    const wEnd = Math.min(w * 7, lastDay)
    result.push({
      time:  `${m}/${wStart}~${m}/${wEnd}`,   // ex) 4/1~4/7, 4/8~4/14
      value: grouped[w] ? parseFloat((grouped[w].sum / grouped[w].count).toFixed(1)) : 0,
      min: grouped[w] ? parseFloat(grouped[w].min.toFixed(1)) : 0,
      max: grouped[w] ? parseFloat(grouped[w].max.toFixed(1)) : 0,
    })
  }
  return result
}

/**
 * 일별 평균/최고/최저 집계
 * @param {Array} data @param {string} valueKey
 * @param {string} startDate @param {string} endDate
 */
export const aggregateByDay = (data, valueKey, startDate, endDate) => {
  const grouped = {}
  data.forEach(d => {
    const day = d.recordedAt?.slice(0, 10)
    if (!day) return
    if (!grouped[day]) grouped[day] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
    const v = d[valueKey] ?? 0
    grouped[day].sum += v
    grouped[day].count += 1
    grouped[day].min = Math.min(grouped[day].min, v)
    grouped[day].max = Math.max(grouped[day].max, v)
  })
  const result  = []
  const current = new Date(startDate)
  const end     = new Date(endDate)
  while (current <= end) {
    const key = formatDate(current)
    result.push({
      time:  key.slice(5).replace('-', '/'),
      value: grouped[key] ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1)) : 0,
      min: grouped[key] ? parseFloat(grouped[key].min.toFixed(1)) : 0,
      max: grouped[key] ? parseFloat(grouped[key].max.toFixed(1)) : 0,
    })
    current.setDate(current.getDate() + 1)
  }
  return result
}

/**
 * 시간별 평균/최고/최저 집계 (오늘이면 현재 시각까지, 과거 날짜면 23시까지)
 * @param {Array} data @param {string} valueKey @param {string} targetDate
 */
export const aggregateByHour = (data, valueKey, targetDate) => {
  const grouped = {}
  data.forEach(d => {
    const hour = d.recordedAt?.slice(11, 13)
    if (!hour) return
    if (!grouped[hour]) grouped[hour] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
    const v = d[valueKey] ?? 0
    grouped[hour].sum += v
    grouped[hour].count += 1
    grouped[hour].min = Math.min(grouped[hour].min, v)
    grouped[hour].max = Math.max(grouped[hour].max, v)
  })
  const isToday = targetDate === formatDate(new Date())
  const maxHour = isToday ? new Date().getHours() : 23
  const result  = []
  for (let h = 0; h <= maxHour; h++) {
    const key = String(h).padStart(2, '0')
    result.push({
      time:  `${h}시`,
      value: grouped[key] ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1)) : 0,
      min: grouped[key] ? parseFloat(grouped[key].min.toFixed(1)) : 0,
      max: grouped[key] ? parseFloat(grouped[key].max.toFixed(1)) : 0,
    })
  }
  return result
}
