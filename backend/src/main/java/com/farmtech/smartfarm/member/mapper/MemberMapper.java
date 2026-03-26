package com.farmtech.smartfarm.member.mapper;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMapper {

    //회원가입 등록
    void insertMember(MemberDTO memberDTO);

    //이메일 중복 체크
    int checkEmailDuplicate(String memberEmail);
}
