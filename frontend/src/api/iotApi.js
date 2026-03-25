const IOT_API = import.meta.env.VITE_IOT_API_URL

// 전체 상태 조회
export const getStatus = async () => {
  const response = await fetch(`${IOT_API}/status`, { cache: 'no-store' })
  return response.json()
}

// LED
export const ledOn = async (brightness = 1.0) => {
  await fetch(`${IOT_API}/led/on`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brightness })
  })
}
export const ledOff = async () => {
  await fetch(`${IOT_API}/led/off`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
}

// 부저
export const buzzerOn = async (freq = 440) => {
  await fetch(`${IOT_API}/buzzer/on`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ freq })
  })
}
export const buzzerOff = async () => {
  await fetch(`${IOT_API}/buzzer/off`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
}

// 팬
export const fanOn = async (speed = 1.0) => {
  await fetch(`${IOT_API}/fan/on`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speed })
  })
}
export const fanOff = async () => {
  await fetch(`${IOT_API}/fan/off`, { method: 'POST' })
}

// 모드 변경 (auto / manual)
export const setMode = async (mode) => {
  await fetch(`${IOT_API}/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  })
}