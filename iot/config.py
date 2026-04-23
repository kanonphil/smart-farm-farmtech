# /home/help/farm_tech/project/src/config.py
#
# ⚠️ 주의: spring.jwt.secret 값과 반드시 동일해야 합니다.
# application-secret.properties의 spring.jwt.secret 값을 그대로 복사하세요.
# pip install python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()

# 백엔드 Spring Boot의 JWT 시크릿 키 (동일한 키로 서명 검증)
JWT_SECRET = os.getenv("JWT_SECRET")

# JWT 알고리즘 (백엔드와 동일하게 HS512)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# 허용할 백엔드 서버 origin (CORS 제한용)
def get_allowed_origins():
  origins = os.getenv("ALLOWED_ORIGINS", "")
  return [origin.strip() for origin in origins.split(",") if origin]

ALLOWED_ORIGINS = get_allowed_origins()

if not JWT_SECRET:
  raise ValueError("JWT_SECRET 환경변수가 설정되지 않았습니다.")