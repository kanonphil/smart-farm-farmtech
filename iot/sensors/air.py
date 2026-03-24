from sensors.spi_bus import read_channel
from gpio_config import GPIOConfig

class AirSensor:
  def __init__(self):
    self._channel = GPIOConfig.AIR_CH

  def _raw_to_ppm(self, raw):
    if raw == 0:
      return None
    voltage = raw * (3.3 / 1023.0)
    return round((voltage / 3.3) * 1000, 2)

  def read(self):
    raw = read_channel(self._channel) # CH1
    ppm = self._raw_to_ppm(raw)
    return raw, ppm