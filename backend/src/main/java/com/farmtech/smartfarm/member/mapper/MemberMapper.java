package com.farmtech.smartfarm.member.mapper;

import com.farmtech.smartfarm.member.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {

    //회원가입 등록
    void insertMember(MemberDTO memberDTO);

    //memberId 조회 메서드
    int getNextMemberId();

    //이메일 중복 체크
    int checkEmailDuplicate(String memberEmail);

    //로그인 회원 정보 조회 메서드
    MemberDTO getLoginInfo(String memberEmail);

    //로그인 회원 정보 전체 조회 메서드
    MemberDTO getAllInfo(String memberEmail);

    //로그인 회원 정보 전체 조회 메서드
    MemberDTO getAllInfos(int memberId);

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

    int getMemberIdByEmail(String email);

    // 아이디 찾기: 이름 + 전화번호로 이메일 조회
    String findEmailByNameAndPhone(@Param("name") String name, @Param("phone") String phone);

    // 비밀번호 찾기: 이메일 + 이름 + 전화번호 일치 여부 확인
    int verifyAccount(@Param("email") String email, @Param("name") String name, @Param("phone") String phone);
}
