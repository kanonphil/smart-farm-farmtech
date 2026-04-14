package com.farmtech.smartfarm.config;

import com.farmtech.smartfarm.jwt.JwtConfirmFilter;
import com.farmtech.smartfarm.jwt.JwtUtil;
import com.farmtech.smartfarm.jwt.LoginFilter;
import com.farmtech.smartfarm.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtUtil jwtUtil;
    private final MemberService memberService;

    //인증 및 인가 설정을 작성하는 메서드
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationConfiguration authConfig) throws Exception {
        //로그인 검증을 처리하는 객체를 의존성 주입으로 받아옴
        AuthenticationManager authenticationManager = authConfig.getAuthenticationManager();

        http
                //CORS 설정. 아래 corsConfigurationSource() 메서드에서 정의한 Bean을 등록함.
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // ── 매니저 전용 ──────────────────────────────
                        .requestMatchers("/dashboards/**").hasRole("MANAGER")
                        .requestMatchers("/manager/**").hasRole("MANAGER")
                        .requestMatchers("/thresholds/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET,   "/products/presign").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/products",  "/products/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT,    "/products/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/products/**").hasRole("MANAGER")
                        .requestMatchers("/products/manager").hasRole("MANAGER")
                        .requestMatchers("/api/actuator/**").hasRole("MANAGER")
                        .requestMatchers("/reviews/manager/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST,   "/reviews/*/reply", "/reviews/*/reply/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/reviews/*/reply/**").hasRole("MANAGER")

                        // ── 로그인 필요 (일반 회원) ──────────────────
                        .requestMatchers("/carts/**").authenticated()
                        .requestMatchers("/orders/**").authenticated()
                        .requestMatchers("/api/payments/**").authenticated()
                        .requestMatchers("/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,   "/members/set-info").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/members/set-pw").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/members/withdraw").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/members/check-email").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/members/**").authenticated()

                        // ── 공개 (비로그인 허용) ─────────────────────
                        .requestMatchers(HttpMethod.POST, "/members").permitAll()          // 회원가입
                        .requestMatchers(HttpMethod.POST, "/members/refresh").permitAll()   // 토큰 갱신
                        .requestMatchers(HttpMethod.POST, "/members/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/members/find-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/members/verify-account").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/members/reset-pw").permitAll()
                        .requestMatchers(HttpMethod.POST, "/members/confirm-pw").permitAll()
                        .requestMatchers("/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/**").permitAll()        // 상품 조회
                        .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()         // 리뷰 조회
                        .requestMatchers(HttpMethod.GET, "/sensors/**").permitAll()         // 센서 조회
                        .requestMatchers(HttpMethod.POST, "/api/ai-chef/**").permitAll()    // Ai Chef
                        // 리뷰 조회는 공개, 작성/수정/삭제는 로그인 필요
                        .requestMatchers(HttpMethod.POST,   "/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/reviews/**").authenticated()

                        // ── 나머지 전부 차단 ─────────────────────────
                        .anyRequest().denyAll()
                );

        //기존 로그인 처리를 담당하는 UsernamePasswordAuthenticationFilter 를 LoginFilter 클래스로 대체
        http.addFilterAt(new LoginFilter(authenticationManager, jwtUtil, memberService), UsernamePasswordAuthenticationFilter.class);

        //로그인 검증 필터 전에 토큰 유무를 판단하는 필터를 추가
        http.addFilterBefore(new JwtConfirmFilter(jwtUtil), LoginFilter.class);
        return http.build();
    }

    //CORS 설정 Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); //쿠키 정보를 통신하기 위한 설정
        config.addAllowedOrigin("http://localhost:5173"); //리액트에서의 요청 허용
        config.addAllowedHeader("*"); //모든 헤더 정보 허용
        config.addAllowedMethod("*"); //get, post, delete, put 등의 요청 메서드 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
