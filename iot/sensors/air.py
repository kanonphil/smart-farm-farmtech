from sensors.spi_bus import read_channel

def raw_to_ppm(raw):
  if raw == 0:
    return None
  voltage = raw * (3.3 / 1023.0)
  return round((voltage / 3.3) * 1000, 2)

def read_air():
  raw = read_channel(1) # CH1
  ppm = raw_to_ppm(raw)
  return raw, ppm