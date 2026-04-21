package com.farmtech.smartfarm.product.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 재고 확인용 경량 DTO
 *
 * 주문 생성 시(OrderMapper)와 결제 확정 시(PaymentMapper) 양쪽에서 사용합니다.
 * requiredQty : PaymentMapper 쿼리에서 ORDER_ITEM_QTY 가 매핑됩니다.
 *               OrderMapper 쿼리에서는 매핑되지 않아 기본값 0입니다.
 */
@Getter
@Setter
public class ProductStockDTO {
  /** 상품 ID */
  private int productId;
  /** 현재 재고 수량 */
  private int productStock;
  /** 필요 수량 — 결제 확정 시 ORDER_ITEM_QTY 가 매핑됨 */
  private int requiredQty;
}
