from gpiozero import MotionSensor, TonalBuzzer
import time

buzzer = TonalBuzzer(23)
pir = MotionSensor(17)

print('모션 감지 테스트 시작 (Ctrl+C로 종료)')
print('센서 초기화 중... 잠시 대기')
pir.wait_for_no_motion()
print('준비 완료!')

while True:
  if pir.motion_detected:
    print('모션 감지! -> 부저 울림')
    buzzer.play(440)
    time.sleep(1.0)
    buzzer.stop()
  else:
    print('모션 없음')

  time.sleep(1.0)