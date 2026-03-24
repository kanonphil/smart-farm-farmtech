from gpiozero import TonalBuzzer
from gpio_config import GPIOConfig

class BuzzerController:

  def __init__(self):
    self._buzzer = TonalBuzzer(GPIOConfig.BUZZER_PIN)

  def buzz_on(self, freq=440):
    self._buzzer.play(freq)

  def buzz_off(self):
    self._buzzer.stop()

  def cleanup(self):
    self._buzzer.close()