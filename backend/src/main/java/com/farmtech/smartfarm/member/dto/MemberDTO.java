package com.farmtech.smartfarm.member.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@ToString
public class MemberDTO {
  private String memberEmail;
  private String memberPw;
  private String memberName;
  private String memberPhone;
  private LocalDate memberBirth;
  private String memberAddr;
  private String memberAddrDetail;
}
