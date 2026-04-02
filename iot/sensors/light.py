from sensors.spi_bus import read_channel
from gpio_config import GPIOConfig

class LightSensor:
  
  def __init__(self):
    self._channel = GPIOConfig.LIGHT_CH

  def _raw_to_lux(self, raw):
    if raw == 0:
      return None
    
    voltage = raw * (3.3 / 1023.0)

    if voltage >= 3.3:
      return None
    
    resistance = 10000 * (3.3 - voltage) / voltage

    if resistance == 0:
      return None
    
    # 로그 기반 근사식
    # lux = (500 / (resistance / 1000)) ** 1.4
    lux = 500 / ((resistance / 1000) ** 1.4)

    return round(lux, 2)

  def read(self):
    raw = read_channel(self._channel)
    return self._raw_to_lux(raw)
