package com.farmtech.smartfarm.jwt;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.service.MemberService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.Cookie;
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
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Iterator;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final MemberService memberService;
    private MemberDTO loginVo;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil, MemberService memberService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.memberService = memberService;

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
            loginVo = vo;
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

        // memberId 조회 추가
        int memberId = memberService.getMemberIdByEmail(userEmail);
        // memberName 조회 추가
        String memberName = memberService.getMemberNameByEmail(userEmail);

        //JWT 토큰 생성
        String token = jwtUtil.createJwt(userEmail, role, memberId, memberName, 1000 * 60 * 60); //1000 = 1초

        // 자동로그인 여부와 관계없이 항상 Refresh Token 발급
        // 자동로그인 OFF → 짧은 유효기간 + 세션 쿠키 (브라우저 닫으면 삭제)
        // 자동로그인 ON  → 긴 유효기간 + 영구 쿠키 (30일 유지)
        String refreshToken = jwtUtil.createRefreshToken(
                userEmail,
                loginVo.isAutoLogin() ? 1000L*60*60*24*30 : 1000L*60*60*24
        );

        //DB에 Refresh Token 저장
        MemberDTO dto = new MemberDTO();
        dto.setMemberEmail(userEmail);
        dto.setRefreshToken(refreshToken);
        dto.setRefreshTokenExpiry(LocalDateTime.now().plusDays(loginVo.isAutoLogin() ? 30 : 1));
        memberService.saveRefreshToken(dto);

        //쿠키에 Refresh Token 저장
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        if (loginVo.isAutoLogin()) {
            refreshCookie.setMaxAge(30 * 24 * 60 * 60); //30일 영구 쿠키
        } else {
            refreshCookie.setMaxAge(-1); //세션 쿠키
        }
        // Refresh Token을 HTTP-only 쿠키로 저장 (웹 브라우저용)
        response.addCookie(refreshCookie);

        // 앱(React Native)은 쿠키를 자동으로 처리하지 못하므로
        // Authorization, Refresh-Token 헤더를 클라이언트에서 읽을 수 있도록 노출
        response.setHeader("Access-Control-Expose-Headers", "Authorization, Refresh-Token");
        response.setHeader("Authorization", "Bearer " + token);

        // Refresh Token을 헤더로도 전달 (앱에서 SecureStore에 저장하여 자동 로그인에 사용)
        response.addHeader("Refresh-Token", refreshToken);

        response.setStatus(HttpStatus.OK.value());

    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        log.info("로그인 검증 실패 - unsuccessfulAuthentication 메서드 호출");
        response.setStatus(HttpStatus.UNAUTHORIZED.value()); //401
    }
}
