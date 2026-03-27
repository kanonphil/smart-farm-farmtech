package com.farmtech.smartfarm.member.controller;


import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.service.MemberService;
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
}
