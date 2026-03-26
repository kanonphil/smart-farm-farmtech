package com.farmtech.smartfarm.member.service;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServcie {
    private final MemberMapper memberMapper;

    //회원가입 등록
    public void insertMember(MemberDTO memberDTO){
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
