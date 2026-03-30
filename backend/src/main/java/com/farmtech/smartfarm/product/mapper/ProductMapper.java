package com.farmtech.smartfarm.product.mapper;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductMapper {

  // 상품 등록 (useGeneratedKeys로 생성된 ID가 productDTO.productId에 자동 주입됨)
  void insertProduct(ProductDTO productDTO);

  // 상품 이미지 등록
  void insertImage(@Param("imgList") List<ProductImageDTO> imgList);

  // 상품 카테고리 조회
  List<ProductCategoryDTO> selectCategory();
}
