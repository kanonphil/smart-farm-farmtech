package com.farmtech.smartfarm.member.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class MemberDTO {
  private int memberId;
  private String firstName;
  private String lastName;
  private String memberEmail;
  private String memberPw;
  private String memberName;
  private String memberPhone;
  private LocalDate memberBirth;
  private String memberAddr;
  private String memberAddrDetail;
  private String memberRole;
  private String memberStatus;
  private LocalDateTime memberCreatedAt;
}
