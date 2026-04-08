package com.farmtech.smartfarm.stock.controller;

import com.farmtech.smartfarm.stock.dto.StockPageResponseDTO;
import com.farmtech.smartfarm.stock.dto.UpdateStockRequestDTO;
import com.farmtech.smartfarm.stock.dto.UpdateStockResponseDTO;
import com.farmtech.smartfarm.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

/**
 * 관리자 재고 관리 API 컨트롤러
 *
 * 모든 엔드포인트는 ROLE_MANAGER 권한 필요
 */
@Slf4j
@RestController
@RequestMapping("/manager/products")
@RequiredArgsConstructor
public class StockController {
  private final StockService stockService;

  /**
   * 재고 목록 조회 API
   * GET /manager/products/stocks?page=0&size=10
   *
   * @param page 페이지 번호 (기본값 0)
   * @param size 페이지 크기 (기본값 10)
   * @return 페이지네이션된 재고 목록
   */
  @GetMapping("/stocks")
  public ResponseEntity<?> getStockList(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
    try {
      StockPageResponseDTO response = stockService.getStockList(page, size);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      log.error("재고 목록 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body("재고 목록 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * 재고 수정 API
   * PATCH /manager/products/{productId}/stock
   *
   * @param productId 상품 ID
   * @param requestDTO 변경할 재고 수량
   * @return 수정 결과
   */
  @PatchMapping("/{productId}/stock")
  public ResponseEntity<?> updateStock(@PathVariable int productId,
                                       @RequestBody UpdateStockRequestDTO requestDTO) {
    try {
      UpdateStockResponseDTO response = stockService.updateStock(productId, requestDTO.getStock());
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (NoSuchElementException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (Exception e) {
      log.error("재고 수정 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body("재고 수정 중 오류가 발생했습니다.");
    }
  }
}
