package com.farmtech.smartfarm.product.mapper;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
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

  // 상품 목록 조회
  List<ProductListDTO> selectProductList(@Param("sort") String sort, @Param("keyword") String keyword);

  // 상세 상품 조회 메서드
  ProductDTO getProductDetail(int productId);
}
