package com.farmtech.smartfarm.product.controller;

import com.farmtech.smartfarm.product.dto.ProductDTO;
import com.farmtech.smartfarm.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;

  @PostMapping
  public ResponseEntity<?> insertProduct(@RequestBody ProductDTO productDTO){
      try {
        productService.insertProduct(productDTO);
        return ResponseEntity.status(HttpStatus.OK).build();
      }catch (Exception e){
        log.error("상품등록 api 오류",e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("상품등록중 오류가 발생했습니다.");
      }
  }
}
