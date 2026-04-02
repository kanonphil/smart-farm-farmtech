package com.farmtech.smartfarm.cart.mapper;

import com.farmtech.smartfarm.cart.dto.CartDTO;
import com.farmtech.smartfarm.cart.dto.CartItemDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CartMapper {

  //cartId 가져올 메서드
  int getNextCartId();

  //cart에 저장 메서드
  void insertCart(CartDTO cartDTO);

  //cartItem에 저장 메서드
  void insertCartItem(CartItemDTO cartItemDTO);

  //cartId 조회 메서드
  int getCartId(int memberId);

  //카트에 상품이 담겨있는지 조회하는 메서드
  boolean findCartItem(int cartId, int productId);

  //이미 담겨있는 상품일 경우 수량 추가 메서드
  void addItem(int cartItemQty, int cartId, int productId);

  //카트에 담긴 상품 조회 메서드
  List<CartItemDTO> getCartItems(int cartId);
}
