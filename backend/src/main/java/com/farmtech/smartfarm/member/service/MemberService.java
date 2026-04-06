package com.farmtech.smartfarm.member.service;

import com.farmtech.smartfarm.cart.dto.CartDTO;
import com.farmtech.smartfarm.cart.mapper.CartMapper;
import com.farmtech.smartfarm.jwt.JwtUtil;
import com.farmtech.smartfarm.member.dto.MemberDTO;
import com.farmtech.smartfarm.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CartMapper cartMapper;

    //회원가입 등록
    @Transactional
    public void insertMember(MemberDTO memberDTO){
        String encodePw = passwordEncoder.encode(memberDTO.getMemberPw());
        memberDTO.setMemberPw(encodePw);
        int memberId = memberMapper.getNextMemberId();
        memberDTO.setMemberId(memberId);
        CartDTO cart = new CartDTO();
        cart.setMemberId(memberId);
        memberMapper.insertMember(memberDTO);
        cartMapper.insertCart(cart);
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

    //로그인 회원 정보 전체 조회 기능 (memberId로 조회)
    public MemberDTO getAllInfos(int memberId){
        return memberMapper.getAllInfos(memberId);
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

    //refresh토큰 저장 기능
    public void saveRefreshToken(MemberDTO memberDTO){
        memberMapper.saveRefreshToken(memberDTO);
    }

    //refresh토큰 조회 기능
    public String refreshAccessToken(String refreshToken){
        //1. DB에서 Refresh Token으로 회원 조회
        MemberDTO member = memberMapper.findByRefreshToken(refreshToken);

        //2. 토큰 없으면 null 반환
        if (member == null) return null;

        //3. 만료 시간 체크
        if (member.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) return null;

        //4. 새 Access Token 발급해서 반환
        return jwtUtil.createJwt(member.getMemberEmail(), member.getMemberRole(), member.getMemberId(),1000 * 60 * 60);
    }

    //로그아웃 시 refresh token 삭제 기능
    public void deleteRefreshToken(String memberEmail) {
        memberMapper.deleteRefreshToken(memberEmail);
    }

    //memberId 조회 기능
    public int getMemberIdByEmail(String email) {
        return memberMapper.getMemberIdByEmail(email);
    }

    /**
     * 아이디 찾기 - 이름 + 전화번호로 이메일 조회 후 마스킹 처리
     * @param name 회원 이름
     * @param phone 전화번호
     * @return 마스킹 된 이메일 (ex: ka***@gmail.com), 없으면 null
     * return에서 마스킹 된 이메일을 반환하면
     * 다른 방법으로 이메일 전체를 확인할 수 없는 문제가 발생하여
     * return email로 수정
     */
    public String findEmail(String name, String phone) {
        String email = memberMapper.findEmailByNameAndPhone(name, phone);
        if (email == null) return null;

        //int atIdx = email.indexOf('@');
        //String local = email.substring(0, atIdx);
        //String masked = local.substring(0, Math.min(2, local.length())) + "***" + email.substring(atIdx);
        //return masked;

        return email;
    }

    /**
     * 비밀번호 찾기 Step 1 - 이메일 + 이름 + 전화번호 일치 여부 확인
     * @param email 이메일
     * @param name 이름
     * @param phone 전화번호
     * @return 일치하면 true
     */
    public boolean verifyAccount(String email, String name, String phone) {
        return memberMapper.verifyAccount(email, name, phone) > 0;
    }

    /**
     * 비밀번호 재설정 - 계정 정보 검증 후 새 비밀번호로 변경
     * @param memberDTO memberEmail, memberName, memberPhone, memberPw(새 비밀번호) 포함
     * @return 정보 불일치 시 false
     */
    public boolean resetPw(MemberDTO memberDTO) {
        boolean verified = verifyAccount(memberDTO.getMemberEmail(), memberDTO.getMemberName(), memberDTO.getMemberPhone());
        if (!verified) return false;
        setNewPw(memberDTO);
        return true;
    }

}
