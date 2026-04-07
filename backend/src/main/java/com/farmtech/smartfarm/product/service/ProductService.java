package com.farmtech.smartfarm.product.service;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProductService {
  private final ProductMapper productMapper;

  // 상품 + 이미지 등록
  @Transactional
  public void insertProduct(ProductDTO productDTO, List<ProductImageDTO> imgList) {
    // 1. 상품 INSERT → DB AUTO_INCREMENT ID가 productDTO.productId에 자동 주입됨
    productMapper.insertProduct(productDTO);

    // 2. 생성된 productId를 이미지 리스트에 세팅
    for (ProductImageDTO img : imgList) {
      img.setProductId(productDTO.getProductId());
    }

    // 3. 이미지 INSERT
    productMapper.insertImage(imgList);
  }

  // 카테고리 조회
  public List<ProductCategoryDTO> selectCategory(){
    return productMapper.selectCategory();
  }

  // 상품 목록 조회
  public List<ProductListDTO> getProductList(String sort, String keyword) {
    return productMapper.selectProductList(sort, keyword);
  }

  // 상품 상세 조회 기능
  public ProductDTO getProductDetail(int productId){
    return productMapper.getProductDetail(productId);
  }

  // 상품 목록 조회(매니저)
  public List<ProductListDTO> selectProductListManager(){
    return productMapper.selectProductListManager();
  }

  // 상품 수정
  public void updateProduct(ProductDTO productDTO) {
    productMapper.updateProduct(productDTO);
  }

  // 상품 삭제
  @Transactional
  public void deleteProduct(int productId){
    productMapper.deleteProductImage(productId); // 이미지 먼저
    productMapper.deleteProduct(productId);       // 상품 삭제
  }
}
