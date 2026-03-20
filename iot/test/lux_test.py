import spidev
import time
import mysql.connector

spi = spidev.SpiDev()
spi.open(0, 0) # vus 0, device 0 (CEO)
spi.max_speed_hz = 1350000

conn = mysql.connector.connect(
  host="192.168.30.147",
  port=3306,
  database="smartfarm",
  user="farmtech",
  password="farmtech"
)
cursor = conn.cursor()

def read_channel(channel):
  adc = spi.xfer2([1, (8 + channel) << 4, 0])
  return ((adc[1] & 3) << 8) + adc[2]

print('조도 -> DB 저장 시작 (Ctrl + C로 종료)')

while True:
  value = read_channel(0) # CH0
  if value == 0:
    print("센서 값 없음, 건너뜀")
  else:
    print(f"조도: {value} -> DB 저장 중...")
    cursor.execute(
      "INSERT INTO SENSOR_LUX (LIGHT_VALUE) VALUES (%s)",
      (value,)
    )
    conn.commit()
    print("DB 저장 완료")
  time.sleep(1.0)
