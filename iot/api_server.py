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
from actuators.fan import FanController
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
_fan = FanController()
dht22 = DHT22Sensor()
light = LightSensor()
air = AirSensor()
pir_sensor = PIRSensor()

# ── 임계값 로드 ───────────────────────────────────────────────

# DB 기본값 (프리셋 로드 실패 시 풀백용)
DEFAULT_THRESHOLD = {
  "temp_high": 30.0,
  "hum_high": 70.0,
  "air_ppm_bad": 500,
  "lux_high": 10000,
  "lux_low": 3000,
}

def load_threshold(cursor):
  """DB에서 현재 활성화 된 프리셋을 읽어 반환. 실패 시 기본값 반환"""
  try:
    cursor.execute(
      "SELECT TEMP_HIGH, HUM_HIGH, AIR_PPM_BAD, LUX_HIGH, LUX_LOW "
      "FROM THRESHOLD_PRESET WHERE IS_ACTIVE = 1 LIMIT 1"
    )
    row = cursor.fetchone()
    if row:
      return {
        "temp_high":   row[0],
        "hum_high":    row[1],
        "air_ppm_bad": row[2],
        "lux_high":    row[3],
        "lux_low":     row[4],
      }
    print("[경고] 활성화된 프리셋 없음 -> 기본값 사용")
    return DEFAULT_THRESHOLD
  except Exception as e:
    print(f"[오류] 임계값 로드 실패: {e} -> 기본값 사용")
    return DEFAULT_THRESHOLD

# ── 공유 상태 ─────────────────────────────────────────────────

state = {
  "mode": "auto",    # "auto" | "manual"
  "threshold": DEFAULT_THRESHOLD,
  "led": {"is_on": False, "brightness": 0.0},
  "buzzer": {"is_on": False, "freq": 440},
  "fan": {"is_on": False, "speed": 0.0},
  "sensor": {
    "temperature": None, "humidity": None,
    "lux": None, "air_raw": None, "air_ppm": None, "motion": False
  }
}
lock = threading.Lock()

# ── 알림 저장 ─────────────────────────────────────────────────

def save_alert(cursor, sensor_type, value, threshold):
  """임계값 초과 시 ALERT_LOG에 저장"""
  try:
    cursor.execute(
      "INSERT INTO ALERT_LOG (SENSOR_TYPE, VALUE, THRESHOLD) VALUES (%s, %s, %s)",
      (sensor_type, value, threshold)
    )
  except Exception as e:
    print(f"[오류] 알림 저장 실패: {e}")

# ── AUTO 모드 LED 제어 ────────────────────────────────────────
def _auto_led(lux, lux_high, lux_low):
  if lux is None:
    return
  if lux >= lux_high:
    _led.off()
    brightness, is_on = 0.0, False
  elif lux <= lux_low:
    _led.on()
    brightness, is_on = 1.0, True
  else:
    ratio = (lux - lux_low) / (lux_high - lux_low)
    brightness = round(max(0.0, min(1.0, 1 - ratio)), 2)
    _led.set_brightness(brightness)
    is_on = True
  with lock:
    state["led"] = {"is_on": is_on, "brightness": brightness}

def _motion_callback():
  with lock:
    if state["mode"] == "auto":
      _buzzer.buzz_on(440)
      state["buzzer"] = {"is_on": True, "freq": 440}

def _no_motion_callback():
  with lock:
    if state["mode"] == "auto":
      _buzzer.buzz_off()
      state["buzzer"] = {"is_on": False, "freq": 440}

pir_sensor.on_motion(_motion_callback)
pir_sensor.on_no_motion(_no_motion_callback)

# ── 백그라운드 센서 루프 ──────────────────────────────────────

def sensor_loop():
  conn = get_connection()
  cursor = conn.cursor()

  with lock:
    state["threshold"] = load_threshold(cursor)  # 최초 로드

  reload_counter = 0            # 임계값 갱신 주기 카운터
  
  while True:
    try:
      # 30회(약 60초)마다 DB에서 임계값 재로드
      if reload_counter >= 30:
        with lock:
          state["threshold"] = load_threshold(cursor)
        reload_counter = 0
      reload_counter += 1
      
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
        threshold = state["threshold"]
        current_mode = state['mode']

      # 자동제어 먼저
      fan_triggers = set()

      if current_mode == "auto":
        # LED 자동 제어
        _auto_led(lux, threshold["lux_high"], threshold["lux_low"])
        
        # 팬 자동 제어 (초과된 센서 종류 반환)
        fan_triggers = _fan.control_fan(
          temp, hum, ppm,
          threshold["temp_high"],
          threshold["hum_high"],
          threshold["air_ppm_bad"]
        )
        with lock:
          state['fan'] = {'is_on': bool(fan_triggers), 'speed': 1.0 if fan_triggers else 0}

        # 임계값 초과 시 알림 저장
        if temp is not None and temp >= threshold["temp_high"]:
          save_alert(cursor, "temperature", temp, threshold["temp_high"])
        if hum is not None and hum >= threshold["hum_high"]:
          save_alert(cursor, "humidity", hum, threshold["hum_high"])
        if ppm is not None and ppm >= threshold["air_ppm_bad"]:
          save_alert(cursor, "air", ppm, threshold["air_ppm_bad"])

      with lock:
        led_on = state['led']['is_on']
        buzzer_on = state['buzzer']['is_on']
        fan_on = state['fan']['is_on']

      # DB 센서 데이터 저장
      if temp is not None and hum is not None:
        cursor.execute(
          "INSERT INTO SENSOR_DHT22 (TEMPERATURE, HUMIDITY, FAN_ON) VALUES (%s, %s, %s)",
          (temp, hum, 1 if ('temperature' in fan_triggers or 'humidity' in fan_triggers) or (current_mode == "manual" and fan_on) else 0)
        )
      if lux is not None:
        cursor.execute(
          "INSERT INTO SENSOR_LIGHT (LIGHT_VALUE, LED_ON) VALUES (%s, %s)",
          (lux, 1 if led_on else 0)
        )
      if raw is not None and raw > 0:
        cursor.execute(
          "INSERT INTO SENSOR_AIR (RAW_VALUE, FAN_ON) VALUES (%s, %s)",
          (raw, 1 if 'air' in fan_triggers or (current_mode == "manual" and fan_on) else 0)
        )
      if motion:
        cursor.execute(
          "INSERT INTO SENSOR_MOTION (BUZZER_ON) VALUES (%s)",
          (1 if buzzer_on else 0,)
        )
      conn.commit()

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

class FanRequest(BaseModel):
  speed: float = 1.0  # 0.0 - 1.0

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
    _fan.fan_off()
    with lock:
      state["led"] = {"is_on": False, "brightness": 0.0}
      state["buzzer"] = {"is_on": False, "freq": 440}
      state["fan"] = {"is_on": False, "speed": 0.0}
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

# ── 팬 API (manual 전용) ─────────────────────────────────────
@app.post("/fan/on")
def fan_on(req: FanRequest):
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  s = max(0.0, min(1.0, req.speed))
  _fan.fan_on(s)
  with lock:
    state["fan"] = {"is_on": True, "speed": s}
  return {"result": "ok", "speed": s}

@app.post("/fan/off")
def fan_off():
  with lock:
    if state["mode"] != "manual":
      return {"error": "manual 모드에서만 제어 가능"}
  _fan.fan_off()
  with lock:
    state["fan"] = {"is_on": False, "speed": 0.0}
  return {"result": "ok"}

# ── 전체 상태 조회 ────────────────────────────────────────────
@app.get("/status")
def get_status():
  with lock:
    return dict(state)

# ── 임계값 즉시 반영 ──────────────────────────────────────────
@app.post("/threshold/reload")
def reload_threshold():
  conn   = get_connection()
  cursor = conn.cursor()
  new_threshold = load_threshold(cursor)
  conn.close()
  with lock:
    state["threshold"] = new_threshold
  return {"result": "ok", "threshold": new_threshold}