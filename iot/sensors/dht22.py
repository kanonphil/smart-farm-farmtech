import board
import adafruit_dht

_dht_device = adafruit_dht.DHT22(board.D27, use_pulseio=False)

def read_dht22():
  try:
    temp = _dht_device.temperature
    humidity = _dht_device.humidity
    if temp is None or humidity is None:
      return None, None
    return temp, humidity
  except RuntimeError:
    return None, None