package com.farmtech.smartfarm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS(Cross-Origin Resource Sharing) 설정 클래스
 *
 * CORS란?
 * - 다른 출처(origin)에서 실행 중인 웹 애플리케이션이
 *   현재 출처의 리소스에 접근할 수 있도록 허용하는 메커니즘
 * - 예: http://localhost:3000(React)에서 http://localhost:8080(Spring)으로 요청
 */
@Configuration  // Spring 설정 클래스임을 명시
public class WebConfig implements WebMvcConfigurer {

  /**
   * CORS 매핑 설정을 추가하는 메서드
   *
   * @param registry CORS 설정을 등록할 레지스트리 객체
   */
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
            .addMapping("/**")  // 모든 경로에 대해 CORS 설정 적용
            // 예: /api/*, /users/*, 등 모든 엔드포인트

            // 허용할 출처(origin) 설정
            .allowedOrigins(
                    "http://localhost:5173"      // Vite React 개발 서버
            )

            // 허용할 HTTP 메서드 설정
            .allowedMethods(
                    "GET",      // 조회
                    "POST",     // 생성
                    "PUT",      // 전체 수정
                    "DELETE"   // 삭제
            )

            // 허용할 헤더 설정
            .allowedHeaders("*")  // 모든 헤더 허용
            // 구체적으로 지정하려면:
            // .allowedHeaders("Content-Type", "Authorization", "X-Requested-With")

            // 클라이언트에서 쿠키나 인증 정보를 포함한 요청을 보낼 수 있도록 허용
            .allowCredentials(true);
    // true 설정 시:
    // - React에서 fetch/axios 요청 시 credentials: 'include' 사용 가능
    // - 쿠키, Authorization 헤더 등을 포함한 요청 가능
    // 주의: allowCredentials(true) 사용 시 allowedOrigins("*")는 사용 불가

  }
}