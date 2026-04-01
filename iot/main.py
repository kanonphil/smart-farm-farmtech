import time
from sensors.dht22 import DHT22Sensor
from sensors.light import LightSensor
from sensors.air import AirSensor
from sensors.motion import PIRSensor
from actuators.led import LEDController
from actuators.buzzer import BuzzerController
from actuators.fan import FanController
from db.connection import get_connection

conn = get_connection()
cursor = conn.cursor()

dht22 = DHT22Sensor()
light = LightSensor()
air = AirSensor()
pir = PIRSensor()
led = LEDController()
buzzer = BuzzerController()
fan = FanController()

# 임계값 (main.py는 DB 프리셋 미사용 — 고정값)
LUX_HIGH = 10000
LUX_LOW = 3000

def on_motion():
  print('모션 감지! -> 부저 울림')
  buzzer.buzz_on(440)
  cursor.execute("INSERT INTO SENSOR_MOTION (BUZZER_ON) VALUES (%s)", (1,))
  conn.commit()

def on_no_motion():
  print('모션 없음')
  buzzer.buzz_off()
  cursor.execute("INSERT INTO SENSOR_MOTION (BUZZER_ON) VALUES (%s)", (0,))
  conn.commit()

pir.on_motion(on_motion)
pir.on_no_motion(on_no_motion)

# pir.on_motion(lambda: buzzer.buzz_on(440))
# pir.on_no_motion(lambda: buzzer.buzz_off())

print("스마트축사 센서 수집 시작 (Ctrl+C로 종료)")

try:
  while True:
    # 온습도
    temp, humidity = dht22.read()

    # 조도
    lux = light.read()

    # 대기질
    raw, ppm = air.read()

    # 액츄에이터 제어 (INSERT 전에 실행해서 상태 확보)
    fan_triggers = fan.control_fan(temp, humidity, ppm)

    led.control(lux, LUX_HIGH, LUX_LOW)
    led_on = led._led.value > 0

    # 온습도 저장
    if temp is not None and humidity is not None:
      print(f"온도: {temp:.1f}°C  습도: {humidity:.1f}%  → DB 저장")
      cursor.execute(
        "INSERT INTO SENSOR_DHT22 (TEMPERATURE, HUMIDITY, FAN_ON) VALUES (%s, %s, %s)",
        (temp, humidity, 1 if ('temperature' in fan_triggers or 'humidity' in fan_triggers) else 0)
      )
      conn.commit()
    else:
      print("온습도 읽기 실패, 건너뜀")

    # 조도 저장
    if lux is not None:
      print(f"조도: {lux} lux  → DB 저장")
      cursor.execute(
        "INSERT INTO SENSOR_LIGHT (LIGHT_VALUE, LED_ON) VALUES (%s, %s)",
        (lux, 1 if led_on else 0)
      )
      conn.commit()
    else:
      print("조도 읽기 실패, 건너뜀")

    # 대기질 저장
    if raw is not None and raw > 0:
      print(f'대기질 RAW: {raw} PPM(근사): {ppm} -> DB 저장')
      cursor.execute(
        "INSERT INTO SENSOR_AIR (RAW_VALUE, FAN_ON) VALUES (%s, %s)",
        (raw, 1 if 'air' in fan_triggers else 0)
      )
      conn.commit()
    else:
      print('대기질 읽기 실패, 건너뜀')

    time.sleep(2.0)

except KeyboardInterrupt:
  dht22.cleanup()
  pir.cleanup()
  led.cleanup()
  buzzer.cleanup()
  fan.cleanup()