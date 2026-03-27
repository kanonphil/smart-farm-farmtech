package com.farmtech.smartfarm.product.service;

import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// 상품 관련 비즈니스 로직 처리
@RequiredArgsConstructor
@Service
public class ProductService {
  private final ProductMapper productMapper;

  //상품등록 메서드
  public void insertProduct(ProductDTO productDTO){
    productMapper.insertProduct(productDTO);
  }
}
