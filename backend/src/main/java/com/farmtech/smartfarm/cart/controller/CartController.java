package com.farmtech.smartfarm.cart.controller;

import com.farmtech.smartfarm.cart.dto.CartItemDTO;
import com.farmtech.smartfarm.cart.service.CartService;
import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/carts")
@Slf4j
public class CartController {
  private final CartService cartService;

  //카트에 상품 저장 api
  @PostMapping("")
  public ResponseEntity<?> insertCartItem(@RequestBody CartItemDTO cartItemDTO, @AuthenticationPrincipal CustomUserDetails userDetails){
    try {
      int memberId = userDetails.getMemberDTO().getMemberId();
      cartService.insertCartItem(cartItemDTO, memberId);
      return ResponseEntity.status(HttpStatus.OK).build();
    }catch (Exception e){
      log.error("카트 상품 저장 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
