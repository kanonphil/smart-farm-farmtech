from gpiozero import MotionSensor
from gpio_config import GPIOConfig

class PIRSensor:
  
  def __init__(self):
    self._pir = MotionSensor(GPIOConfig.MOTION_PIN)

  def on_motion(self, callback):
    self._pir.when_motion = callback  # 감지 즉시 실행

  def on_no_motion(self, callback):
    self._pir.when_no_motion = callback  # 사라지면 즉시 실행

  def read(self):
    return self._pir.motion_detected
  
  def cleanup(self):
    self._pir.close()