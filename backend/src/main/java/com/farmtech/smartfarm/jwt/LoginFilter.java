package com.farmtech.smartfarm.jwt;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Iterator;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;

        //로그인 요청 url 변경
        setFilterProcessesUrl("/members/login");
        setUsernameParameter("memberEmail");
        setPasswordParameter("memberPw");
    }

    //로그인 절차가 진행되면 LoginFilter 클래스의 attemptAuthentication() 메서드 실행

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        log.info("attemptAuthentication() 메서드 실행");

        //전달된 아이디 및 비번을 저장하기 위한 객체
        MemberDTO vo = new MemberDTO();

        //로그인 요청 시 전달되는 아이디 및 비번을 받는 코드
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            ServletInputStream inputStream = request.getInputStream();
            String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            vo = objectMapper.readValue(messageBody, MemberDTO.class);
        }catch (IOException e){
            throw new RuntimeException(e);
        }
        log.info("입력받은 아이디 : " + vo.getMemberEmail());
        log.info("입력받은 비밀번호 : " + vo.getMemberPw());

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(vo.getMemberEmail(), vo.getMemberPw(), null);
        Authentication authentication = authenticationManager.authenticate(authToken);
        log.info("로그인 중인 유저 : " + authentication.getName());
        return authentication;
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        log.info("로그인 검증 성공 - successfulAuthentication 메서드 호출");

        //1. 로그인 검증 성공 유저의 이메일
        String userEmail = authResult.getName();

        //2. 로그인 검증 성공 유저의 권한 정보
        Collection<? extends GrantedAuthority> authorities = authResult.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        //JWT 토큰 생성
        String token = jwtUtil.createJwt(userEmail, role, 1000 * 60 * 60); //1000 = 1초

        //생성한 토큰을 응답 헤더에 담아 React에 전달
        response.setHeader("Access-Control-Expose-Headers", "Authorization");
        response.setHeader("Authorization", "Bearer " + token);
        response.setStatus(HttpStatus.OK.value());
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        log.info("로그인 검증 실패 - unsuccessfulAuthentication 메서드 호출");
        response.setStatus(HttpStatus.UNAUTHORIZED.value()); //401
    }
}
