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

import java.util.List;

@RestController
@RequestMapping("/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;
  private final UploadUtil uploadUtil;

  //상품 + 이미지 등록 api
  @PostMapping("")
  public ResponseEntity<?> insertProduct(ProductDTO productDTO,
                                         @RequestParam("mainImg") MultipartFile mainImgFile,
                                         @RequestParam("subImgs") MultipartFile[] subImgs,
                                         @RequestParam("detailImg") MultipartFile detailImgFile) {
    try {
      // 대표 이미지 업로드
      ProductImageDTO dto = uploadUtil.fileUpload(mainImgFile);

      // 서브 이미지들 업로드
      List<ProductImageDTO> imgList = uploadUtil.multipleFileUpload(subImgs);

      // 상세 페이지 이미지 업로드
      ProductImageDTO detailDTO = uploadUtil.fileUpload(detailImgFile);
      detailDTO.setImageType("DETAIL");
      imgList.add(detailDTO);

      // 대표 이미지도 리스트에 합치기
      imgList.add(dto);

      // PRODUCT INSERT 후 생성된 ID로 PRODUCT_IMAGE INSERT (service 내부에서 처리)
      productService.insertProduct(productDTO, imgList);

      return ResponseEntity.status(HttpStatus.CREATED).build();
    } catch (Exception e) {
      log.error("상품등록 api 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품등록중 오류가 발생했습니다.");
    }
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
          @RequestParam(value = "sort", required = false) String sort) {
    try {
      List<ProductListDTO> productList = productService.getProductList(sort);
      return ResponseEntity.status(HttpStatus.OK).body(productList);
    } catch (Exception e) {
      log.error("상품 목록 조회 api 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 매니저 상품 전체 목록 조회 api (ACTIVE + INACTIVE)
  @GetMapping("/manager")
  public ResponseEntity<?> selectProductListManager() {
    try {
      List<ProductListDTO> productList = productService.selectProductListManager();
      return ResponseEntity.status(HttpStatus.OK).body(productList);
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
  @PutMapping("/{productId}")
  public ResponseEntity<?> updateProduct(@PathVariable("productId") int productId,
                                         @RequestBody ProductDTO productDTO) {
    try {
      productDTO.setProductId(productId);
      productService.updateProduct(productDTO);
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

}
