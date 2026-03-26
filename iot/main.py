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

def on_motion():
  print('모션 감지! -> 부저 울림')
  buzzer.buzz_on(440)

def on_no_motion():
  print('모션 없음')
  buzzer.buzz_off()

pir.on_motion(on_motion)
pir.on_no_motion(on_no_motion)

# pir.on_motion(lambda: buzzer.buzz_on(440))
# pir.on_no_motion(lambda: buzzer.buzz_off())

print("스마트축사 센서 수집 시작 (Ctrl+C로 종료)")

try:
  while True:
    # 온습도
    temp, humidity = dht22.read()
    if temp is not None and humidity is not None:
      print(f"온도: {temp:.1f}°C  습도: {humidity:.1f}%  → DB 저장")
      cursor.execute(
          "INSERT INTO SENSOR_DHT22 (TEMPERATURE, HUMIDITY) VALUES (%s, %s)",
          (temp, humidity)
      )
      conn.commit()
    else:
      print("온습도 읽기 실패, 건너뜀")

    # 조도
    lux = light.read()
    if lux is not None:
      print(f"조도: {lux} lux  → DB 저장")
      cursor.execute(
        "INSERT INTO SENSOR_LIGHT (LIGHT_VALUE) VALUES (%s)",
        (lux,)
      )
      conn.commit()
      led.control(lux) # LED 제어 추가
    else:
      print("조도 읽기 실패, 건너뜀")

    # 대기질
    raw, ppm = air.read()
    if raw is not None and raw > 0:
      print(f'대기질 RAW: {raw} PPM(근사): {ppm} -> DB 저장')
      cursor.execute(
        "INSERT INTO SENSOR_AIR (RAW_VALUE) VALUES (%s)",
        (raw,)
      )
      conn.commit()
    else:
      print('대기질 읽기 실패, 건너뜀')

    # 모션감지(적외선)
    # if pir.read():
    #   print('모션 감지! -> 부저 울림')
    #   buzzer.buzz_on(440)
    # else:
    #   print('모션 없음')
    #   buzzer.buzz_off()

    # 팬 작동
    fan.control_fan(temp, humidity, ppm)
    
    time.sleep(2.0)

except KeyboardInterrupt:
  dht22.cleanup()
  pir.cleanup()
  led.cleanup()
  buzzer.cleanup()
  fan.cleanup()