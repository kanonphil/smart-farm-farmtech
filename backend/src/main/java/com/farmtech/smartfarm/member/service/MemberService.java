package com.farmtech.smartfarm.member.service;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    //마이페이지 접속 시 비밀번호 확인 기능
    public boolean confirmPw (MemberDTO memberDTO) {
        MemberDTO member = memberMapper.getLoginInfo(memberDTO.getMemberEmail());
        System.out.println(memberDTO.getMemberPw());
        return passwordEncoder.matches(memberDTO.getMemberPw(), member.getMemberPw()); // (평문, 암호화된 값)
    }

    //로그인 회원 정보 전체 조회 기능
    public MemberDTO getAllInfo(String memEmail){
        return memberMapper.getAllInfo(memEmail);
    }

    //회원 정보 수정 기능
    public void setMemberInfo(MemberDTO memberDTO){
        memberMapper.setMemberInfo(memberDTO);
    }

    //비밀번호 수정 기능
    public void setNewPw(MemberDTO memberDTO){
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String newPw = encoder.encode(memberDTO.getMemberPw());
        memberDTO.setMemberPw(newPw);
        memberMapper.setNewPw(memberDTO);
    }

}
