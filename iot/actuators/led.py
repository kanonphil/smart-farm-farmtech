from gpiozero import PWMLED
from gpio_config import GPIOConfig

class LEDController:
  # 조도 임계값
  # LUX_HIGH = 10000 # 이상이면 LED OFF
  # LUX_LOW = 3000 # 이하이면 LED 최대
  # 하드코딩 삭제 후 사용자 지정 임계값 사용

  def __init__(self):
    self._led = PWMLED(GPIOConfig.LED_PIN)

  def control(self, lux, lux_high, lux_low):
    """조도값과 임계값을 받아 LED 자동 제어"""
    if lux is None:
      return
    if lux >= lux_high:
      self._led.off()
      print('조도 높음 -> LED OFF')
    elif lux <= lux_low:
      self._led.on()
      print('조도 낮음 -> LED 최대')
    else:
      # lux_low - lux_high 사이 -> 조도에 반비례해서 밝기 조절
      brightness = 1 - ((lux - lux_low) / (lux_high - lux_low))
      self._led.value = round(brightness, 2)
      print(f'조도 보통 -> LED 밝기 {round(brightness * 100)}%')

  def on(self):
    self._led.on()

  def off(self):
    self._led.off()

  def set_brightness(self, value):
    self._led.value = value

  def cleanup(self):
    self._led.close()