# Smart Farm FarmTech

FarmTech 팀의 스마트 축사 관리 플랫폼입니다.  
IoT 센서를 활용해 가축 환경을 실시간 모니터링하고, LED, 팬, 물펌프 등 장치를 자동으로 제어할 수 있는 시스템입니다.  
백엔드는 Spring Boot, 프론트엔드는 React(Vite)로 개발되었습니다.

---

## 📌 주요 기능

### 센서 데이터 수집
- 온도 / 습도 센서
- 조도 센서
- 대기질 센서
- 모션 감지 센서

### 액추에이터 제어
- LED, 선풍기, 부저, 모터 드라이버
- 환경 조건에 따라 자동 제어

### 데이터 관리
- MariaDB 원격 데이터베이스 연동
- MyBatis를 이용한 쿼리 관리
- 실시간 데이터 대시보드 제공

---

## 🛠 개발 환경

- Backend: Spring Boot, Java 17, Python3
- Frontend: React (Vite), JavaScript / TypeScript
- Database: MariaDB
- IDE: IntelliJ IDEA
- 빌드 도구: Gradle

---

## ⚙️ 설치 및 실행

### 1. Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun   # IntelliJ Run 가능
