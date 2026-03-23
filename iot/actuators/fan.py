from gpiozero import PWMOutputDevice, OutputDevice

FAN_IA_PIN = 5 
FAN_IB_PIN = 6

TEMP_HIGH = 30.0
HUMIDITY_HIGH = 70.0
AIR_PPM_BAD = 500

_fan_ia = PWMOutputDevice(FAN_IA_PIN)
_fan_ib = OutputDevice(FAN_IB_PIN, initial_value=False)

def fan_on(speed=1.0):
  """팬 켜기 (speed: 0.0 ~ 1.0)"""
  _fan_ib.off()
  _fan_ia.value = max(0.0, min(1.0, speed))
  print(f"팬 ON -> 속도 {round(speed * 100)}%")

def fan_off():
  """팬 끄기"""
  _fan_ia.off()
  _fan_ib.off()
  print("팬 OFF")

def control_fan(temp, humidity, air_ppm):
  """센서 값에 따라 팬 자동 제어"""
  reasons = []

  if temp is not None and temp >= TEMP_HIGH:
    reasons.append(f"온도 {temp}°C")

  if humidity is not None and humidity >= HUMIDITY_HIGH:
    reasons.append(f"습도 {humidity}%")

  if air_ppm is not None and air_ppm >= AIR_PPM_BAD:
    reasons.append(f"대기질 {air_ppm}ppm")

  if reasons:
    fan_on(1.0)
    print(f"팬 자동 ON -> 원인: {', '.join(reasons)}")
  else:
    fan_off()