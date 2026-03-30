package com.farmtech.smartfarm.member.mapper;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMapper {

    //회원가입 등록
    void insertMember(MemberDTO memberDTO);

    //이메일 중복 체크
    int checkEmailDuplicate(String memberEmail);

    //로그인 회원 정보 조회 메서드
    MemberDTO getLoginInfo(String memberEmail);

    //로그인 회원 정보 전체 조회 메서드
    MemberDTO getAllInfo(String memberEmail);

    //회원 정보 수정 메서드
    void setMemberInfo(MemberDTO memberDTO);

    //비밀번호 수정 메서드
    void setNewPw(MemberDTO memberDTO);

    //refresh token 저장 메서드
    void saveRefreshToken(MemberDTO memberDTO);

    //refresh token 조회 메서드
    MemberDTO findByRefreshToken(String refreshToken);

    //로그아웃 시 refresh token 삭제 메서드
    void deleteRefreshToken(String memberEmail);
}
