package com.farmtech.smartfarm.product.controller;

import com.farmtech.smartfarm.product.dto.ProductCategoryDTO;
import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import com.farmtech.smartfarm.product.dto.ProductListDTO;
import com.farmtech.smartfarm.product.service.ProductService;
import com.farmtech.smartfarm.util.UploadUtil;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;
  private final UploadUtil uploadUtil;

  //상품 + 이미지 등록 api
  @PostMapping("")
  public ResponseEntity<?> insertProduct(@RequestBody ProductDTO productDTO) {
    try {
      List<ProductImageDTO> imgList = new ArrayList<>();

      //대표 이미지
      if (productDTO.getMainImgUrl() != null) {
        ProductImageDTO mainDto = new ProductImageDTO();
        mainDto.setImageSavedName(productDTO.getMainImgUrl());
        mainDto.setImageOriginName(productDTO.getMainImgUrl());
        mainDto.setImageType("MAIN");
        imgList.add(mainDto);
      }

      //서브 이미지
      int order = 1;
      if (productDTO.getSubImgUrls() != null){
        for(String subs : productDTO.getSubImgUrls()) {
          ProductImageDTO subDto = new ProductImageDTO();
          subDto.setImageSavedName(subs);
          subDto.setImageOriginName(subs);
          subDto.setImageType("SUB");
          subDto.setImageOrder(order++);
          imgList.add(subDto);
        }
      }

      //상세 이미지
      if (productDTO.getDetailImgUrl() != null) {
        ProductImageDTO detailDto = new ProductImageDTO();
        detailDto.setImageSavedName(productDTO.getDetailImgUrl());
        detailDto.setImageOriginName(productDTO.getDetailImgUrl());
        detailDto.setImageType("DETAIL");
        imgList.add(detailDto);
      }

      // PRODUCT INSERT 후 생성된 ID로 PRODUCT_IMAGE INSERT (service 내부에서 처리)
      productService.insertProduct(productDTO, imgList);

      return ResponseEntity.status(HttpStatus.CREATED).build();
    } catch (Exception e) {
      log.error("상품등록 api 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품등록중 오류가 발생했습니다.");
    }
  }

  //s3에 업로드할 수 있는 임시 권한 URL을 발급해주는 API
  @GetMapping("/presign")
  public ResponseEntity<Map<String,String>> getPresignUrl(@RequestParam String fileName){
    return ResponseEntity.ok(uploadUtil.generatePresignedUrl(fileName));
  }

  // 카테고리 조회 api
  @GetMapping("/category")
  public ResponseEntity<?> selectCategory(){
    try {
      List<ProductCategoryDTO> category = productService.selectCategory();
      return ResponseEntity.status(HttpStatus.OK).body(category);
    }catch (Exception e){
      log.error("상품등록 시 카테고리 조회 api 오류",e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 상품 목록 조회 api
  @GetMapping("")
  public ResponseEntity<?> getProductList(
          @RequestParam(value = "sort", required = false) String sort, @RequestParam(value = "keyword", required = false) String keyword, @RequestParam(value = "categoryId", required = false) Integer categoryId) {
    try {
      log.info("keyword: {}", keyword);
      List<ProductListDTO> productList = productService.getProductList(sort, keyword, categoryId);
      return ResponseEntity.status(HttpStatus.OK).body(productList);
    } catch (Exception e) {
      log.error("상품 목록 조회 api 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 매니저 상품 전체 목록 조회 api (ACTIVE + INACTIVE)
  @GetMapping("/manager")
  public ResponseEntity<?> selectProductListManager(
          @RequestParam(value = "categoryId", required = false) Integer categoryId,
          @RequestParam(value = "status", required = false) String status,
          @RequestParam(value = "keyword", required = false) String keyword,
          @RequestParam(value = "page", defaultValue = "0") int page,
          @RequestParam(value = "size", defaultValue = "8") int size ) {
    try {
      Map<String, Object> result = productService.selectProductListManager(categoryId, status, keyword, page, size);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      log.error("상품 목록 조회(매니저) api 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 상품 상세 정보 조회 api
  @GetMapping("/{productId}")
  public ResponseEntity<?> getProductDetail(@PathVariable("productId") int productId){
    try {
      ProductDTO productDTO = productService.getProductDetail(productId);
      return ResponseEntity.status(HttpStatus.OK).body(productDTO);
    }catch (Exception e){
      log.error("상품 상세 정보 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 상품 수정 api
  @PutMapping(value = "/{productId}", consumes = "multipart/form-data")
  public ResponseEntity<?> updateProduct(
          @PathVariable("productId") int productId,
          ProductDTO productDTO,
          @RequestParam(value = "mainImg",         required = false) MultipartFile mainImgFile,
          @RequestParam(value = "subImgs",         required = false) MultipartFile[] subImgFiles,
          @RequestParam(value = "detailImg",       required = false) MultipartFile detailImgFile,
          @RequestParam(value = "deletedImageIds", required = false) List<Integer> deletedImageIds) {
    try {
      productDTO.setProductId(productId);
      productService.updateProduct(productDTO, mainImgFile, subImgFiles, detailImgFile, deletedImageIds);
      return ResponseEntity.status(HttpStatus.OK).build();
    } catch (Exception e) {
      log.error("상품 수정 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //상품 삭제 api
  @DeleteMapping("/{productId}")
  public ResponseEntity<?> deleteProduct(@PathVariable("productId") int productId){
    try {
      productService.deleteProduct(productId);
      return ResponseEntity.status(HttpStatus.OK).build();
    }catch (Exception e){
      log.error("상품 삭제 오류",e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //검색어 추천
  @GetMapping("/recommended-keywords")
  public ResponseEntity<?> getRecommendedKeywords() {
    return ResponseEntity.ok(productService.getRecommendedKeywords());
  }


}
