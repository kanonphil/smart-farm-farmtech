package com.farmtech.smartfarm.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private SecretKey secretKey;

    public JwtUtil(@Value("${spring.jwt.secret}") String secret){
        secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS512.key().build().getAlgorithm());
    }

    // 공통 Claims 추출 메서드. token의 payload를 추출한다.
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    //token의 subject 추출메서드. subject를 추출하면 유저이름(이메일)을 나온다.
    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }

    //token의 권한 정보 추출
    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    //token의 memberId 추출
    public int getMemberId(String token) {
        return parseClaims(token).get("memberId", Integer.class);
    }

    // token의 회원 이름 추출
    public String getMemberName(String token) {
      return parseClaims(token).get("memberName", String.class);
    }


  //token의 만료시간이 지났으면 true, 만료가 되지 않았으면 false를 리턴
    public Boolean isExpired(String token) {
        try{
            return parseClaims(token).getExpiration().before(new Date());
        }catch (ExpiredJwtException e){
            return true;
        }
    }

    /**
     * 토큰 생성 메서드
     * @param username 회원아이디
     * @param role 권한
     * @param expirationTime 만료날짜및시간 1000 -> 1초
     * @return 위 정보가 담긴 토큰을 리턴
     */
    public String createJwt(String username, String role, int memberId, String memberName, long expirationTime) {
        return Jwts.builder()
                .signWith(secretKey, Jwts.SIG.HS512)    //암호화 방식지정. 비밀키 & HS512 알고리즘으로 토큰 암호화 진행
                .header()
                .add("typ", "JWT")      // 기본값이긴 하지만 명시적으로 지정 가능
                .add("alg", "HS512")    // 일반적으로 자동으로 처리되지만 명시 가능
                .and()
                .subject(username)      //유저이름
                .claim("role", role)    //권한
                .claim("memberId", memberId)
                .claim("memberName", memberName)
                .issuedAt(new Date(System.currentTimeMillis()))                      //토큰 발행 시간
                .expiration(new Date(System.currentTimeMillis() + expirationTime))   //토큰 만료 시간
                .compact();

    }

    // Refresh Token 생성 (유효기간은 호출 시 결정)
    public String createRefreshToken(String email, long expirationTime) {
        return Jwts.builder()
                .subject(email)  // 토큰 안에 이메일 담기
                .issuedAt(new Date())  // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + expirationTime))  // 만료시간
                .signWith(secretKey)  // 시크릿 키로 서명
                .compact(); // 문자열로 변환해서 반환
    }

  /**
   * 디바이스 전용 JWT 생성 (라즈베리파이 인증용)
   *
   * @param deviceId 디바이스 식별자 (예: "raspberry-pi-001")
   * @param expirationTime 만료 시간 (밀리초)
   * @return 서명된 디바이스 JWT
   */
  public String createDeviceToken(String deviceId, long expirationTime) {
    return Jwts.builder()
            .signWith(secretKey, Jwts.SIG.HS512)
            .header().add("typ", "JWT").add("alg", "HS512").and()
            .subject(deviceId)
            .claim("role", "DEVICE")
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expirationTime))
            .compact();
  }

}
