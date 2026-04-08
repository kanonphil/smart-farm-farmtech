package com.farmtech.smartfarm.stock.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 재고 수정 요청 DTO
 */
@Getter
@Setter
public class UpdateStockRequestDTO {
  // 변경할 재고 수량 (0 이상)
  private int stock;
}
