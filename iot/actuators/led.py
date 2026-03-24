from gpiozero import PWMLED
from gpio_config import GPIOConfig

class LEDController:
  # 조도 임계값
  LUX_HIGH = 10000 # 이상이면 LED OFF
  LUX_LOW = 3000 # 이하이면 LED 최대

  def __init__(self):
    self._led = PWMLED(GPIOConfig.LED_PIN)

  def control(self, lux):
    if lux is None:
      return
    if lux >= self.LUX_HIGH:
      self._led.off()
      print('조도 높음 -> LED OFF')
    elif lux <= self.LUX_LOW:
      self._led.on()
      print('조도 낮음 -> LED 최대')
    else:
      # 3000~10000 사이 -> 조도에 반비례해서 밝기 조절
      brightness = 1 - ((lux - self.LUX_LOW) / (self.LUX_HIGH - self.LUX_LOW))
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