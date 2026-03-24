import adafruit_dht
from gpio_config import GPIOConfig

class DHT22Sensor:
  def __init__(self):
    self._dht_device = adafruit_dht.DHT22(GPIOConfig.DHT22_PIN, use_pulseio=False)

  def read(self):
    try:
      temp = self._dht_device.temperature
      humidity = self._dht_device.humidity
      if temp is None or humidity is None:
        return None, None
      return temp, humidity
    except RuntimeError:
      return None, None
    
  def cleanup(self):
    self._dht_device.exit()