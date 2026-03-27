package com.farmtech.smartfarm.member.service;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    //회원가입 등록
    public void insertMember(MemberDTO memberDTO){
        String encodePw = passwordEncoder.encode(memberDTO.getMemberPw());
        memberDTO.setMemberPw(encodePw);
        memberMapper.insertMember(memberDTO);
    }

    //이메일 중복 체크
    public boolean isEmailDuplicate(String memEmail){
        int count = memberMapper.checkEmailDuplicate(memEmail);

        return count > 0;
    }

    //로그인 회원 정보 조회 기능
    public MemberDTO getLoginInfo(String memEmail){
        return memberMapper.getLoginInfo(memEmail);
    }
}
