package com.farmtech.smartfarm.member.service;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.member.dto.MemberDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final MemberService memberService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("loadUserByUsername 메서드 실행");
        MemberDTO dto = memberService.getLoginInfo(username);

        if (dto == null){
            log.info("일치하는 아이디 없음");
            throw new UsernameNotFoundException("없는 이메일 : " + username);
        }

        return new CustomUserDetails(dto);
    }
}
