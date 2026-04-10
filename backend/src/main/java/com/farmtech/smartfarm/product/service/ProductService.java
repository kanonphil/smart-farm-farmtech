package com.farmtech.smartfarm.product.service;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.mapper.ProductMapper;
import com.farmtech.smartfarm.util.UploadUtil;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
  public List<ProductListDTO> getProductList(String sort, String keyword, Integer categoryId) {
    return productMapper.selectProductList(sort, keyword, categoryId);
  }

  // 상품 상세 조회 기능
  public ProductDTO getProductDetail(int productId){
    return productMapper.getProductDetail(productId);
  }

  // 상품 목록 조회(매니저)
  public Map<String, Object> selectProductListManager(Integer categoryId, String status, String keyword, int page, int size){
    int offset = page * size;

    Map<String, Object> params = new HashMap<>();
    params.put("categoryId", categoryId);
    params.put("status",     status);
    params.put("keyword",    keyword);
    params.put("size",       size);
    params.put("offset",     offset);

    List<ProductListDTO> content = productMapper.selectProductListManager(params);
    int totalCount = productMapper.countProductListManager(params);

    Map<String, Object> result = new HashMap<>();
    result.put("content",    content);
    result.put("totalCount", totalCount);
    result.put("totalPages", (int) Math.ceil((double) totalCount / size));

    return result;
  }

  // 상품 수정
  @Transactional
  public void updateProduct(ProductDTO productDTO,
                            MultipartFile mainImgFile,
                            MultipartFile[] subImgFiles,
                            MultipartFile detailFile,
                            List<Integer> deletedImageIds) throws IOException {
    // 텍스트 정보 항상 업데이트
    productMapper.updateProduct(productDTO);

    // 대표 이미지 (선택했을 때만)
    if (mainImgFile != null && !mainImgFile.isEmpty()) {
      ProductImageDTO mainImg = uploadUtil.fileUpload(mainImgFile);
      mainImg.setProductId(productDTO.getProductId());
      mainImg.setImageType("MAIN");
      productMapper.updateProductImage(mainImg);
    }

    // 서브 이미지 (선택했을 때만 -> 기존 삭제 후 새로 INSERT)
    if (deletedImageIds != null) {
      for (int imageId : deletedImageIds) {
        productMapper.deleteProductImageById(imageId);
      }
    }
    if (subImgFiles != null && subImgFiles.length > 0 && !subImgFiles[0].isEmpty()) {
      List<ProductImageDTO> sub = uploadUtil.multipleFileUpload(subImgFiles);
      for (ProductImageDTO subImg : sub) {
        subImg.setProductId(productDTO.getProductId());
      }
      productMapper.insertImage(sub);
    }

    // 상세 페이지 이미지 (선택했을 때만)
    if (detailFile != null && !detailFile.isEmpty()) {
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
