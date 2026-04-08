package com.farmtech.smartfarm.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 재고 수정 결과 응답 DTO
 */
@Getter
@AllArgsConstructor
public class UpdateStockResponseDTO {
  private int productId;
  private String productName;
  private int stock;
}
