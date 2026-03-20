from gpiozero import TonalBuzzer

_buzzer = TonalBuzzer(23)

def buzz_on(freq=440):
  _buzzer.play(freq)

def buzz_off():
  _buzzer.stop()