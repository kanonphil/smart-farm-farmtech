import spidev
import time
import mysql.connector

spi = spidev.SpiDev()
spi.open(0, 0)
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

print("MQ-135 → DB 저장 시작 (Ctrl+C로 종료)")

while True:
    raw = read_channel(1)
    if raw == 0:
        print("센서 값 없음, 건너뜀")
    else:
        print(f"RAW: {raw} → DB 저장 중...")
        cursor.execute(
            "INSERT INTO SENSOR_AIR (RAW_VALUE) VALUES (%s)",
            (raw,)
        )
        conn.commit()
        print("DB 저장 완료")
    time.sleep(2.0)
