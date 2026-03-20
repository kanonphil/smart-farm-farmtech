import spidev

spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 1350000

def read_channel(channel):
  adc = spi.xfer2([1, (8 + channel) << 4, 0])
  return ((adc[1] & 3) << 8) + adc[2]