package com.farmtech.smartfarm.config;

import com.farmtech.smartfarm.jwt.JwtConfirmFilter;
import com.farmtech.smartfarm.jwt.JwtUtil;
import com.farmtech.smartfarm.jwt.LoginFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        //기존 로그인 처리를 담당하는 UsernamePasswordAuthenticationFilter 를 LoginFilter 클래스로 대체
        http.addFilterAt(new LoginFilter(authenticationManager, jwtUtil), UsernamePasswordAuthenticationFilter.class);

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

    //비밀번호 암호화 기능을 제공하는 객체
    //복호화 기능은 제공되지 않으므로 초기화만 가능
    @Bean
    public PasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
