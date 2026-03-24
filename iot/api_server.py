# /home/help/farm_tech/project/src/api_server.py
# 실행: cd /home/help/farm_tech/project/src
#        uvicorn api_server:app --host 0.0.0.0 --port 8000

import time
import threading

from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sensors.dht22 import DHT22Sensor
from sensors.light import LightSensor
from sensors.air import AirSensor
from sensors.motion import PIRSensor
from actuators.led import LEDController
from actuators.buzzer import BuzzerController
from db.connection import get_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
  # startup
  thread = threading.Thread(target=sensor_loop, daemon=True)
  thread.start()
  print("FaseAPI 서버 시작 / 센서 루프 실행 중")

  yield

  # shutdown (선택)
  print("FaseAPI 서버 종료")

app = FastAPI(title="SmartFarm Actuator API", lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # 테스트용 전체 허용
  allow_methods=["*"],
  allow_headers=["*"],
)

# GPIO 핀 (기존 actuators 파일과 동일한 핀 번호 사용)
_led = LEDController()
_buzzer = BuzzerController()
dht22 = DHT22Sensor()
light = LightSensor()
air = AirSensor()
pir_sensor = PIRSensor()

# 공유 상태 (센서 루프 <-> API 핸들러)
state = {
  "mode": "auto",    # "auto" | "manual"
  "led": {"is_on": False, "brightness": 0.0},
  "buzzer": {"is_on": False, "freq": 440},
  "sensor": {
    "temperature": None, "humidity": None,
    "lux": None, "air_raw": None, "air_ppm": None, "motion": False
  }
}
lock = threading.Lock()

conn = get_connection()
cursor = conn.cursor()

# ── AUTO 모드 액츄에이터 로직 (기존 main.py 동일) ──────────
def _auto_led(lux):
  if lux is None:
    return
  if lux >= 10000:
    _led.off()
    brightness, is_on = 0.0, False
  elif lux <= 3000:
    _led.on()
    brightness, is_on = 1.0, True
  else:
    brightness = round(1 - ((lux - 3000) / 7000), 2)
    _led.set_brightness(brightness)
    is_on = True
  with lock:
    state["led"] = {"is_on": is_on, "brightness": brightness}

def _auto_buzzer(motion):
  if motion:
    _buzzer.buzz_on(440)
    with lock:
      state["buzzer"] = {"is_on": True, "freq": 440}
  else:
    _buzzer.buzz_off()
    with lock:
      state["buzzer"] = {"is_on": False, "freq": 440}

# ── 백그라운드 센서 루프 (기존 main.py 루프를 스레드로) ─────
def sensor_loop():
  while True:
    try:
      temp, hum = dht22.read()
      lux = light.read()
      raw, ppm = air.read()
      motion = pir_sensor.read()

      with lock:
        state["sensor"].update({
          "temperature": temp, "humidity": hum,
          "lux": lux, "air_raw": raw,
          "air_ppm": ppm, "motion": motion
        })

      # DB 저장
      if temp is not None and hum is not None:
        cursor.execute(
          "INSERT INTO SENSOR_DHT22 (TEMPERATURE, HUMIDITY) VALUES (%s, %s)",
          (temp, hum)
        )
      if lux is not None:
        cursor.execute(
          "INSERT INTO SENSOR_LIGHT (LIGHT_VALUE) VALUES (%s)",
          (lux,)
        )
      if raw is not None and raw > 0:
        cursor.execute(
          "INSERT INTO SENSOR_AIR (RAW_VALUE) VALUES (%s)",
          (raw,)
        )
      conn.commit()

      # AUTO 모드일 때만 자동 제어
      with lock:
        current_mode = state["mode"]
      if current_mode == "auto":
        _auto_led(lux)
        _auto_buzzer(motion)
      # MANUAL 모드면 API 요청으로만 제어

    except Exception as e:
      print(f"[오류] {e}")
    time.sleep(2.0)

# ── 요청 모델 ───────────────────────────────────────────────
class ModeRequest(BaseModel):
  mode: str  # "auto" | "manual"

class LedRequest(BaseModel):
  brightness: float = 1.0

class BuzzerRequest(BaseModel):
  freq: int = 440

# ── 모드 API ────────────────────────────────────────────────
@app.get("/mode")
def get_mode():
  with lock:
    return {"mode": state["mode"]}

@app.post("/mode")
def set_mode(req: ModeRequest):
  if req.mode not in ("auto", "manual"):
    return {"error": "auto 또는 manual 만 허용"}
  with lock:
    state["mode"] = req.mode
  if req.mode == "auto":
    _led.off()
    _buzzer.buzz_off()
    with lock:
      state["led"] = {"is_on": False, "brightness": 0.0}
      state["buzzer"] = {"is_on": False, "freq": 440}
  return {"mode": req.mode}

# ── LED API (manual 전용) ────────────────────────────────────
@app.post("/led/on")
def led_on(req: LedRequest):
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  b = max(0.0, min(1.0, req.brightness))
  _led.set_brightness(b)
  with lock:
    state["led"] = {"is_on": True, "brightness": b}
  return {"result": "ok", "brightness": b}

@app.post("/led/off")
def led_off():
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  _led.off()
  with lock:
    state["led"] = {"is_on": False, "brightness": 0.0}
  return {"result": "ok"}


# ── 부저 API (manual 전용) ───────────────────────────────────
@app.post("/buzzer/on")
def buzzer_on(req: BuzzerRequest):
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  _buzzer.buzz_on(req.freq)
  with lock:
    state["buzzer"] = {"is_on": True, "freq": req.freq}
  return {"result": "ok", "freq": req.freq}

@app.post("/buzzer/off")
def buzzer_off():
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  _buzzer.buzz_off()
  with lock:
    state["buzzer"] = {"is_on": False, "freq": 440}
  return {"result": "ok"}


# ── 전체 상태 조회 ────────────────────────────────────────────
@app.get("/status")
def get_status():
  with lock:
    return dict(state)