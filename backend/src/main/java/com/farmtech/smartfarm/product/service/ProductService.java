package com.farmtech.smartfarm.product.service;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import com.farmtech.smartfarm.util.UploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ProductService {
  private final ProductMapper productMapper;
  private final UploadUtil uploadUtil;

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
  @Transactional
  public void updateProduct(ProductDTO productDTO,
                            MultipartFile mainImgFile,
                            MultipartFile[] subImgFiles,
                            MultipartFile detailFile) throws IOException {
    // 텍스트 정보 항상 업데이트
    productMapper.updateProduct(productDTO);

    // 대표 이미지 (선택했을 때만)
    if(mainImgFile != null && !mainImgFile.isEmpty()){
      ProductImageDTO mainImg = uploadUtil.fileUpload(mainImgFile);
      mainImg.setProductId(productDTO.getProductId());
      mainImg.setImageType("MAIN");
      productMapper.updateProductImage(mainImg);
    }
    // 서브 이미지 (선택했을 때만 -> 기존 삭제 후 새로 INSERT)
    if(subImgFiles != null && subImgFiles.length > 0 && !subImgFiles[0].isEmpty()){
      productMapper.deleteProductImageByType(productDTO.getProductId(), "SUB");
      List<ProductImageDTO> sub = uploadUtil.multipleFileUpload(subImgFiles);
      for (ProductImageDTO subimg : sub){
        subimg.setProductId(productDTO.getProductId());
      }
      productMapper.insertImage(sub);
    }
    // 상세 페이지 이미지 (선택했을 때만)
    if(detailFile != null && !detailFile.isEmpty()){
      ProductImageDTO detailImg = uploadUtil.fileUpload(detailFile);
      detailImg.setProductId(productDTO.getProductId());
      detailImg.setImageType("DETAIL");
      productMapper.updateProductImage(detailImg);
    }

  }
  // 상품 삭제
  @Transactional
  public void deleteProduct(int productId){
    productMapper.deleteProduct(productId);       // 상품 삭제
  }
}
