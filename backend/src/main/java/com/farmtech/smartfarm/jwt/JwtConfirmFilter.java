package com.farmtech.smartfarm.jwt;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.member.dto.MemberDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
//클라이언트가 서버로 요청 시 토큰을 검증하는 필터
//OncePerRequestFilter 클래스는 요청 시 무조건 한번 실행되는 필터 기능을 가짐
public class JwtConfirmFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    //이 메서드는 모든 요청마다 무조건 실행
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("doFilterInternal - doFilterInternal() 메서드 실행");

        //요청 헤더에 담긴 토큰 정보 받기
        String authorization = request.getHeader("Authorization");

        //Authorization 정보가 없거나, 토큰이 Bearer로 시작하지 않으면...
        if(authorization == null || !authorization.startsWith("Bearer ")){
            System.out.println("토큰 정보가 없습니다.");

            //필터 진행 후 다음 코드 이어서 진행하는 코드
            filterChain.doFilter(request, response);

            return;
        }

        //요청 헤더에서 받아온 토큰 정보에서 Bearer 키워드를 제거
        String token = authorization.split(" ")[1];

        //필터 진행 후 다음 코드 이어서 진행하는 코드
        // filterChain.doFilter(request, response);
        boolean isExpired = jwtUtil.isExpired(token);

        //토큰 만료기간이 지났으면
        if(isExpired){
            log.info("토큰 만료");
            // filterChain.doFilter(request, response);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        //아래 코드는 토큰이 정상적일 때 실행
        //아래 전체코드는 토큰이 존재하는 회원을 spring한테 임시적으로 로그인했다고 알려주는 코드
        log.info("토큰 검증 성공");

        String username = jwtUtil.getUsername(token);
        String role = jwtUtil.getRole(token);

        MemberDTO member = new MemberDTO();
        member.setMemberEmail(username);
        member.setMemberRole(role);

        CustomUserDetails customUserDetails = new CustomUserDetails(member);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
