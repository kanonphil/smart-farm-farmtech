class GPIOConfig:
  # 센서 핀
  DHT22_PIN = 27  # 온습도 센서
  MOTION_PIN = 17  # 모션 감지 센서 (PIR)

  # SPI 채널 (조도, 대기질을 MCP3008 ADC 사용)
  SPI_BUS = 0
  SPI_DEVICE = 0
  SPI_SPEED_HZ = 1350000
  LIGHT_CH = 0  # 조도 센서 CH0
  AIR_CH = 1  # 대기질 센서 CH1

  # 액츄에이터 핀
  LED_PIN = 18  # PWM LED
  BUZZER_PIN = 23  # 부저