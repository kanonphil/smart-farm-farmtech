import time
from sensors.dht22 import read_dht22
from sensors.light import read_light
from sensors.air import read_air
from db.connection import get_connection

conn = get_connection()
cursor = conn.cursor()

print("스마트축사 센서 수집 시작 (Ctrl+C로 종료)")

while True:
  # 온습도
  temp, humidity = read_dht22()
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
  lux = read_light()
  if lux is not None:
    print(f"조도: {lux} lux  → DB 저장")
    cursor.execute(
      "INSERT INTO SENSOR_LIGHT (LIGHT_VALUE) VALUES (%s)",
      (lux,)
    )
    conn.commit()
  else:
    print("조도 읽기 실패, 건너뜀")

  # 대기질
  raw, ppm = read_air()
  if raw is not None and raw > 0:
    print(f'대기질 RAW: {raw} PPM(근사): {ppm} -> DB 저장')
    cursor.execute(
      "INSERT INTO SENSOR_AIR (RAW_VALUE) VALUES (%s)",
      (raw,)
    )
    conn.commit()
  else:
    print('대기질 읽기 실패, 건너뜀')

  time.sleep(2.0)