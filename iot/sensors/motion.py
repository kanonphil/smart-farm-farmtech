from gpiozero import MotionSensor
from gpio_config import GPIOConfig

class PIRSensor:
  def __init__(self):
    self._pir = MotionSensor(GPIOConfig.MOTION_PIN)

  def read(self):
    return self._pir.motion_detected
  
  def cleanup(self):
    self._pir.close()