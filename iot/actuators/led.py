from gpiozero import PWMLED

LED_PIN = 18 # GPIO 핀 번호 입력 예정

_led = PWMLED(LED_PIN)

# 조도 임계값
LUX_HIGH = 10000 # 이상이면 LED OFF
LUX_LOW = 3000 # 이하이면 LED 최대

def control_led(lux):
  if lux is None:
    return
  if lux >= LUX_HIGH:
    _led.off()
    print('조도 높음 -> LED OFF')
  elif lux <= LUX_LOW:
    _led.on()
    print('조도 낮음 -> LED 최대')
  else:
    # 3000~10000 사이 -> 조도에 반비례해서 밝기 조절
    brightness = 1 - ((lux - LUX_LOW) / (LUX_HIGH - LUX_LOW))
    _led.value = round(brightness, 2)
    print(f'조도 보통 -> LED 밝기 {round(brightness * 100)}%')