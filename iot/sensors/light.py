from sensors.spi_bus import read_channel

def raw_to_lux(raw):
  if raw == 0:
    return None
  voltage = raw * (3.3 / 1023.0)
  if voltage >= 3.3:
    return None
  resistance = 10000 * (3.3 - voltage) / voltage
  if resistance == 0:
    return None
  lux = round(500 / resistance * 10000, 2)
  return lux

def read_light():
  raw = read_channel(0)
  return raw_to_lux(raw)
