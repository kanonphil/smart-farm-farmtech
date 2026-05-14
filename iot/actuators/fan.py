from gpiozero import PWMOutputDevice, OutputDevice
from gpio_config import GPIOConfig
import time

class FanController:
  MIN_DUTY = 0.40  # 모터가 실제 회전을 시작하는 최소 duty cycle
  MAX_DUTY = 0.99  # 1.0은 PWM 안되고 DC 고정이라 제외
  
  def __init__(self):
    self._fan_ia = PWMOutputDevice(GPIOConfig.FAN_IA_PIN)
    self._fan_ib = OutputDevice(GPIOConfig.FAN_IB_PIN, initial_value=False)

  def fan_on(self, speed=1.0):
    speed = max(0.0, min(1.0, speed))
    duty = self.MIN_DUTY + (self.MAX_DUTY - self.MIN_DUTY) * speed

    if self._fan_ia.value == 0:
      # 정지 → 기동: 긴 kick
      self._fan_ib.off()
      self._fan_ia.value = self.MAX_DUTY
      time.sleep(0.3)
    elif abs(self._fan_ia.value - duty) > 0.01:
      # 켜진 상태 → 속도 변경: 짧은 kick
      self._fan_ib.off()
      self._fan_ia.value = self.MAX_DUTY
      time.sleep(0.15)

    self._fan_ib.off()
    self._fan_ia.value = duty
    print(f"팬 ON → 속도 {round(speed * 100)}% (duty: {round(duty * 100)}%)")

  def fan_off(self):
    """팬 끄기"""
    self._fan_ia.off()
    self._fan_ib.off()
    # print("팬 OFF")

  def _normalize(self, value, low, high):
    """low 이하면 0.0, high 이상이면 1.0, 그 사이는 비례"""
    if value is None:
      return 0.0
    
    if value <= low:
      return 0.0
    
    if value >= high:
      return 1.0
    
    return (value - low) / (high - low)

  def control_fan(self, temp, humidity, air_ppm, temp_low, temp_high, hum_low, hum_high, air_ppm_low, air_ppm_bad):
    """센서 값에 따라 팬 자동 제어"""
    reasons = []
    speeds = []

    temp_speed = self._normalize(temp, temp_low, temp_high)
    hum_speed = self._normalize(humidity, hum_low, hum_high)
    air_speed = self._normalize(air_ppm, air_ppm_low, air_ppm_bad)

    if temp_speed > 0:
      reasons.append("temperature")
      speeds.append(temp_speed)

    if hum_speed > 0:
      reasons.append("humidity")
      speeds.append(hum_speed)

    if air_speed > 0:
      reasons.append("air")
      speeds.append(air_speed)

    if speeds:
      final_speed = max(speeds)
      self.fan_on(final_speed)
      print(f"팬 자동 ON -> 속도 {round(final_speed * 100)}%, 원인: {', '.join(set(reasons))}")
    else:
      final_speed = 0.0
      self.fan_off()

    return {
      "reasons": set(reasons),
      "speed": round(final_speed, 2)
    }
  
  def set_speed(self, speed):
    """켜진 상태에서 속도를 실시간으로 변경합니다. (kick 포함)"""
    speed = max(0.0, min(1.0, speed))
    duty = self.MIN_DUTY + (self.MAX_DUTY - self.MIN_DUTY) * speed

    self._fan_ib.off()
    self._fan_ia.value = self.MAX_DUTY  # 잠깐 킥으로 모터 재인식
    time.sleep(0.15)
    self._fan_ia.value = duty
    print(f"팬 속도 변경 → {round(speed * 100)}% (duty: {round(duty * 100)}%)")

  def cleanup(self):
    self._fan_ia.close()
    self._fan_ib.close()