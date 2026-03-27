package com.farmtech.smartfarm.product.mapper;

import com.farmtech.smartfarm.product.dto.ProductDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper {

  //상품 등록 메서드
  void insertProduct(ProductDTO productDTO);
}
