package com.farmtech.smartfarm.member.dto;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;


//UserDetails 인터페이스는 사용자 정보를 담을 수 있는 security에서 사용하는 자료형
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {
  private final MemberDTO memberDTO;

  @Override //계정의 권한정보를 리턴하는 메서드
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Collection<GrantedAuthority> collection = new ArrayList<>();

    collection.add(new GrantedAuthority() {
      @Override
      public String getAuthority() {
        return memberDTO.getMemberRole();
      }
    });

    return collection;
  }

  @Override //계정의 비밀번호를 리턴
  public String getPassword() {
    return memberDTO.getMemberPw();
  }

  @Override //계정의 아이디를 리턴
  public String getUsername() {
    return memberDTO.getMemberEmail();
  }

  //만료되지 않은 계정인가?
  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  //잠기지 않은 계정인가?
  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  //자격증명이 만료되지 않았는가?
  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  //사용가능 상태의 계정인가?
  @Override
  public boolean isEnabled() {
    return true;
  }
}