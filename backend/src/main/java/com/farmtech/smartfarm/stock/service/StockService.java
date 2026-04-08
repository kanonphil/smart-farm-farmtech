package com.farmtech.smartfarm.stock.service;

import com.farmtech.smartfarm.stock.dto.StockListDTO;
import com.farmtech.smartfarm.stock.dto.StockPageResponseDTO;
import com.farmtech.smartfarm.stock.dto.UpdateStockResponseDTO;
import com.farmtech.smartfarm.stock.mapper.StockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * 관리자 재고 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class StockService {
  private final StockMapper stockMapper;

  /**
   * 재고 목록 페이지 조회
   * 기본 정렬: 재고 오름차순
   *
   * @param page 페이지 번호 (0-base)
   * @param size 페이지 크기
   * @return 페이지네이션 응답 DTO
   */
  public StockPageResponseDTO getStockList(int page, int size) {
    int offset = page * size;
    List<StockListDTO> content = stockMapper.selectStockList(size, offset);
    int total = stockMapper.countProducts();
    int totalPages = (int) Math.ceil((double) total / size);

    // 전체 재고 상태별 집계
    int dangerCount  = stockMapper.countDanger();
    int warningCount = stockMapper.countWarning();
    int safeCount    = stockMapper.countSafe();

    return new StockPageResponseDTO(
            content, total, totalPages, page, size,
            dangerCount, warningCount, safeCount
    );
  }

  /**
   * 상품 재고 수정
   *
   * @param productId 상품 ID
   * @param stock 변경할 재고 수량
   * @return 수정 결과 응답 DTO
   * @throws IllegalArgumentException 음수 재고 입력 시
   * @throws NoSuchElementException 상품 미존재 시
   */
  @Transactional
  public UpdateStockResponseDTO updateStock(int productId, int stock) {
    // 음수 재고 방지
    if (stock < 0) {
      throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
    }

    // 상품 존재 확인
    StockListDTO product = stockMapper.selectProductById(productId);
    if (product == null) {
      throw new NoSuchElementException("존재하지 않는 상품입니다.");
    }

    // 재고 업데이트
    int result = stockMapper.updateProductStock(productId, stock);
    if (result != 1) {
      throw new IllegalStateException("재고 수정에 실패했습니다.");
    }

    return new UpdateStockResponseDTO(productId, product.getProductName(), stock);
  }
}
