package com.farmtech.smartfarm.cart.service;

import com.farmtech.smartfarm.cart.dto.CartDTO;
import com.farmtech.smartfarm.cart.dto.CartItemDTO;
import com.farmtech.smartfarm.cart.mapper.CartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

  // 카트에 담긴 상품 조회 기능
  public List<CartItemDTO> getCartItems(int memberId){
    int cartId = cartMapper.getCartId(memberId);
    return cartMapper.getCartItems(cartId);
  }

  //수량 변경 기능
  public void updateCnt(CartItemDTO cartItemDTO){
    cartMapper.updateCnt(cartItemDTO);
  }

  //선택 삭제 기능
  public void deleteItem(List<Integer> idList){
    cartMapper.deleteItem(idList);
  }

  //전체 삭제 기능
  public void deleteAllItem(int memberId){
    int cartId = cartMapper.getCartId(memberId);
    cartMapper.deleteAllItem(cartId);
  }
}
