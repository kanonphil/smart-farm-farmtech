from gpiozero import MotionSensor

_pir = MotionSensor(17)

def read_motion():
  return _pir.motion_detected