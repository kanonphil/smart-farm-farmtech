package com.farmtech.smartfarm.member.controller;


import com.farmtech.smartfarm.jwt.JwtUtil;
import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.service.MemberService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/members")
@Slf4j
@RestController
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    //회원가입 등록 API
    @PostMapping
    public ResponseEntity<?> insertMember(@RequestBody MemberDTO memberDTO){
        try {
            memberService.insertMember(memberDTO);
            return ResponseEntity.status(HttpStatus.OK).build();
        }catch (Exception e){
            log.error("회원가입 등록 API 오류",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 오류가 발생했습니다.");
        }
    }
    /**
     * 회원가입 시 이메일 중복 체크 API
     * @param email 중복 확인을 할 이메일 주소
     * @return 중복이면 true, 사용 가능하면 false 리턴
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam("memEmail") String email){
        try {
            boolean isDuplicate = memberService.isEmailDuplicate(email);
            return ResponseEntity.status(HttpStatus.OK).body(isDuplicate);
        }catch (Exception e){
            log.error("이메일 중복 체크 중 서버 오류 발생",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //마이페이지 접속 시 비밀번호 확인 api
    @PostMapping("/confirm-pw")
    public ResponseEntity<?> confirmPw(@RequestBody MemberDTO memberDTO){
        try {
            boolean result = memberService.confirmPw(memberDTO);
            System.out.println(result);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        }catch(Exception e){
            log.error("비밀번호 확인 중 서버 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //로그인 한 회원 전체 정보 조회 api
    @GetMapping("/{memEmail}")
    public ResponseEntity<?> getAllInfo(@PathVariable("memEmail") String memEmail){
        try {
            MemberDTO memberDTO = memberService.getAllInfo(memEmail);
            return ResponseEntity.status(HttpStatus.OK).body(memberDTO);
        }catch (Exception e){
            log.error("회원 정보 전체 조회 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //회원 정보 수정 api
    @PutMapping("/set-info")
    public ResponseEntity<?> setMemberInfo(@RequestBody MemberDTO memberDTO){
        try {
            memberService.setMemberInfo(memberDTO);
            return ResponseEntity.status(HttpStatus.OK).build();
        }catch (Exception e){
            log.error("회원 정보 수정 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //비밀번호 수정 api
    @PatchMapping("/set-pw")
    public ResponseEntity<?> setNewPw(@RequestBody MemberDTO memberDTO){
        try {
            memberService.setNewPw(memberDTO);
            return ResponseEntity.status(HttpStatus.OK).build();
        }catch (Exception e){
            log.error("비밀번호 수정 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //refresh token 발급 api
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false)String refreshToken){
        String newAccessToken = memberService.refreshAccessToken(refreshToken);

        if (newAccessToken == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok()
                .header("Authorization", "Bearer " + newAccessToken)
                .header("Access-Control-Expose-Headers", "Authorization")
                .build();
    }

    //로그아웃 시 refresh token 삭제 api
    @PostMapping("/logout")
    public ResponseEntity<?> deleteRefreshToken(@RequestHeader("Authorization") String token, HttpServletResponse response) {
        try {
            String email = jwtUtil.getUsername(token.replace("Bearer ", ""));
            memberService.deleteRefreshToken(email);

            Cookie refreshCookie = new Cookie("refreshToken", null);
            refreshCookie.setMaxAge(0);
            refreshCookie.setPath("/");
            response.addCookie(refreshCookie);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
