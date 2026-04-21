package com.farmtech.smartfarm.payment.mapper;

import com.farmtech.smartfarm.payment.dto.PaymentDTO;
import com.farmtech.smartfarm.product.dto.ProductStockDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {

  PaymentDTO selectOrderByTossOrderId(@Param("orderId") String orderId);

  int updateOrderPaid(@Param("orderId") String orderId,
                      @Param("paymentKey") String paymentKey);

  PaymentDTO selectOrderByOrderId(@Param("orderId") int orderId);

  int updateOrderRefunded(@Param("orderId") int orderId,
                          @Param("cancelReason") String cancelReason);

  int decreaseProductStock(@Param("orderId") int orderId);

  int restoreProductStock(@Param("orderId") int orderId);

  /**
   * 결제 확정 전 재고 잠금 조회 (FOR UPDATE)
   *
   * requiredQty 에 ORDER_ITEM_QTY 가 매핑됩니다.
   * Toss 호출 전 재고를 확인해 결제 후 재고 부족 상황을 방지합니다.
   *
   * @param orderId 내부 정수형 ORDER_ID
   */
  List<ProductStockDTO> selectProductStockForUpdate(@Param("orderId") int orderId);
}