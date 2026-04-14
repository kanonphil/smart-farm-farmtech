# 🥩 한우마루 - 스마트팜 한우 쇼핑몰

> 최고의 한우를 스마트팜에서 식탁까지 — FarmTech 팀의 한우 전문 쇼핑몰 플랫폼

IoT 센서로 관리되는 스마트 축사에서 생산된 한우를 판매하는 풀스택 쇼핑몰입니다.  
Gemini AI 기반 레시피 추천, 리뷰 AI 분석, 실시간 SSE 알림, 스마트팜 모니터링/제어 기능을 제공합니다.

---

## 👥 팀원

| 이름 | GitHub | 역할 |
|------|--------|------|
| 최유정 | [@kanonphil](https://github.com/kanonphil) | 풀스택 |
| 백대훈 | [@qoreogns3](https://github.com/qoreogns3) | 풀스택 |
| 허준일 | [@sogb7244](https://github.com/sogb7244) | 풀스택 |

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **Backend** | Spring Boot 3, Java 17, MyBatis, Spring Security |
| **Frontend** | React 19, Vite, Zustand, React Router v6 |
| **Database** | MariaDB |
| **인증** | JWT (Access Token + Refresh Token), BCrypt |
| **실시간 통신** | SSE (Server-Sent Events) |
| **AI** | Google Gemini API (gemini-2.0-flash / gemini-2.0-flash-lite) |
| **결제** | 토스페이먼츠 (TossPayments) |
| **IoT** | Raspberry Pi, Python3, MariaDB 센서 연동 |
| **빌드** | Gradle |

---

## ✨ 주요 기능

### 🛒 쇼핑몰

메인 홈페이지에서 배너, 추천 상품, 공지사항을 확인할 수 있습니다.

![메인 홈페이지](https://github.com/user-attachments/assets/932722fd-8cf7-4371-abe8-8f0a7358555d)

한우 상품 목록을 카테고리별로 필터링하고 검색어 자동완성을 통해 상품을 찾을 수 있습니다.

![상품 목록](https://github.com/user-attachments/assets/5ce17ee1-8a66-48d4-aea4-5e90799dc638)

상품 상세 페이지에서 이미지 갤러리, 수량 선택, 바로 구매 / 장바구니 담기가 가능합니다.

| 상품정보 탭 | 상품리뷰 탭 |
|:-----------:|:-----------:|
| ![상품 상세 - 상품정보](https://github.com/user-attachments/assets/ff739663-b024-4bce-a5f7-7bcb31b33fa9) | ![상품 상세 - 상품리뷰](https://github.com/user-attachments/assets/374ec38d-fde4-454e-bb8c-4af61630250c) |

---

### 🤖 AI 셰프

Gemini AI가 보유 재료와 취향을 입력받아 한우 레시피를 추천합니다.  
조리 순서, 셰프 팁, 추천 상품 연동까지 한 번에 제공됩니다.

![AI 셰프](https://github.com/user-attachments/assets/6ab1c5ce-c2c5-4703-9ea1-af61c55db9cf)

---

### 👤 마이페이지

주문 내역 조회, 구매 확정, 주문 취소가 가능합니다.

![주문 내역](https://github.com/user-attachments/assets/65ddf642-ea3b-4ac8-8f05-a4d831ace6ec)

구매한 상품에 별점과 리뷰를 작성하고, 판매자 답글을 확인할 수 있습니다.  
리뷰에 답글이 달리면 SSE 실시간 알림이 발송됩니다.

![리뷰 관리](https://github.com/user-attachments/assets/373eb8db-3f00-44ce-96bc-ef9b52359694)

---

### 🏢 매니저 대시보드

금일 매출, 신규 주문·회원 현황, 월별 판매 수익 차트, 주문 상태 도넛 차트를 한눈에 확인합니다.

![매니저 대시보드](https://github.com/user-attachments/assets/3b52a6a1-8678-4f20-b514-61f4356e4feb)

재고 수준을 위험(0~9개) / 주의(10~49개) / 안정(50개 이상)으로 시각화하고 즉시 수정할 수 있습니다.

![재고 관리](https://github.com/user-attachments/assets/848730de-1e37-4035-b1c4-62ecf09ef0f1)

전체 주문 목록을 조회하고 상태별로 필터링할 수 있습니다.

![주문 관리](https://github.com/user-attachments/assets/da2cc552-0d03-480f-b526-818def10d9b5)

Gemini AI가 리뷰를 자동 분석하여 CLEAN / SUSPICIOUS / TOXIC으로 분류합니다.  
TOXIC 리뷰는 자동 블라인드 처리되며, 판매자 답글 작성/수정이 가능합니다.

![리뷰 관리](https://github.com/user-attachments/assets/a0871aa7-024a-4536-9fce-62a506fe896d)

---

### 🌿 스마트팜 IoT

온도·습도·조도·대기질(CO₂) 센서 데이터를 실시간 수집하고 시계열 차트로 시각화합니다.

![센서 데이터 분석](https://github.com/user-attachments/assets/01c13283-f938-4c85-9e2f-42c7023ee5e9)

![센서 데이터 차트](https://github.com/user-attachments/assets/6dbaa9eb-66ce-4b2c-9c85-fc4120b112cf)

LED 밝기, 팬 속도, 부저 등 액추에이터를 수동/자동 모드로 제어하고 임계값을 설정합니다.

![기기 제어](https://github.com/user-attachments/assets/1e06ebd5-e861-4419-aad5-f16ff116d404)

---

## ⚙️ 설치 및 실행

### 1. Backend

```bash
cd backend
./gradlew bootRun
```

`src/main/resources/application.properties` 설정:

```properties
# DB
spring.datasource.url=jdbc:mariadb://YOUR_DB_HOST:3306/YOUR_DB
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD

# JWT
jwt.secret=YOUR_JWT_SECRET

# Gemini API (Google AI Studio에서 발급)
gemini.api.key.chef=YOUR_CHEF_API_KEY
gemini.api.key.review=YOUR_REVIEW_API_KEY

# TossPayments
toss.secret.key=YOUR_TOSS_SECRET_KEY
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

`.env` 설정:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TOSS_CLIENT_KEY=YOUR_TOSS_CLIENT_KEY
```

---

## 📁 프로젝트 구조

```
smartfarm/
├── backend/
│   └── src/main/java/com/farmtech/smartfarm/
│       ├── ai/          # Gemini AI (Chef, Review)
│       ├── cart/        # 장바구니
│       ├── iot/         # 스마트팜 센서·기기 제어
│       ├── member/      # 회원 인증·관리
│       ├── notification/ # SSE 실시간 알림
│       ├── order/       # 주문·결제
│       ├── product/     # 상품 관리
│       └── review/      # 리뷰·답글·AI 분석
└── frontend/
    └── src/
        ├── api/         # Axios API 모듈
        ├── components/  # 공통 컴포넌트
        ├── pages/       # 페이지 컴포넌트
        └── store/       # Zustand 전역 상태
```

---

## 📄 라이선스

This project is for educational purposes.
