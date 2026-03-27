from gpiozero import PWMOutputDevice, OutputDevice
from gpio_config import GPIOConfig

class FanController:
  # TEMP_HIGH = 30.0
  # HUMIDITY_HIGH = 70.0
  # AIR_PPM_BAD = 500
  
  def __init__(self):
    self._fan_ia = PWMOutputDevice(GPIOConfig.FAN_IA_PIN)
    self._fan_ib = OutputDevice(GPIOConfig.FAN_IB_PIN, initial_value=False)

  def fan_on(self, speed=1.0):
    """팬 켜기 (speed: 0.0 ~ 1.0)"""
    self._fan_ib.off()
    self._fan_ia.value = max(0.0, min(1.0, speed))
    print(f"팬 ON -> 속도 {round(speed * 100)}%")

  def fan_off(self):
    """팬 끄기"""
    self._fan_ia.off()
    self._fan_ib.off()
    # print("팬 OFF")

  def control_fan(self, temp, humidity, air_ppm, temp_high, hum_high, air_ppm_bad):
    """센서 값에 따라 팬 자동 제어"""
    reasons = []

    if temp is not None and temp >= temp_high:
      reasons.append("temperature")

    if humidity is not None and humidity >= hum_high:
      reasons.append("humidity")

    if air_ppm is not None and air_ppm >= air_ppm_bad:
      reasons.append("air")

    if reasons:
      self.fan_on(1.0)
      print(f"팬 자동 ON -> 원인: {', '.join(set(reasons))}")
    else:
      self.fan_off()

    return set(reasons)

  def cleanup(self):
    self._fan_ia.close()
    self._fan_ib.close()