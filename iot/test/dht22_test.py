import time
import board
import adafruit_dht
import mysql.connector

# DHT22 초기화
dhtDevice = adafruit_dht.DHT22(board.D27, use_pulseio=False)

# DB 연결
conn = mysql.connector.connect(
  host="192.168.30.147",
  port=3306,
  database="smartfarm",
  user="farmtech",
  password="farmtech"
)
cursor = conn.cursor()

while True:
  try:
    temp_c = dhtDevice.temperature
    humidity = dhtDevice.humidity

    if temp_c is None or humidity is None:
      print('센서 값 없음, 건너뜀')
    else:
      print(f'Temp: {temp_c:.1f}°C Humidity: {humidity:.1f}%')
      cursor.execute(
        "INSERT INTO SENSOR_DHT22 (TEMPERATURE, HUMIDITY) VALUES (%s, %s)",
        (temp_c, humidity)
      )
      conn.commit()
      print('DB 저장 완료')

  except RuntimeError as e:
    print('읽기 오류:', e.args[0])

  time.sleep(2.0)