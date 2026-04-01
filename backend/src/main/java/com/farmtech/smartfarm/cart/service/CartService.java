package com.farmtech.smartfarm.cart.service;

import com.farmtech.smartfarm.cart.dto.CartDTO;
import com.farmtech.smartfarm.cart.dto.CartItemDTO;
import com.farmtech.smartfarm.cart.mapper.CartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
  private final CartMapper cartMapper;

  //장바구니 상품 추가 기능
  public void insertCartItem(CartItemDTO cartItemDTO, int memberId){
    int cartId = cartMapper.getCartId(memberId);
    boolean exists = cartMapper.findCartItem(cartId, cartItemDTO.getProductId());
    if(exists){
      int cnt = cartItemDTO.getCartItemQty();
      int productId = cartItemDTO.getProductId();
      cartMapper.addItem(cnt ,cartId, productId);
    }
    else {
      cartItemDTO.setCartId(cartId);
      cartMapper.insertCartItem(cartItemDTO);
    }
  }


}
