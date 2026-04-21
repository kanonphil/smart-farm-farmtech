package com.farmtech.smartfarm.order.mapper;

import com.farmtech.smartfarm.order.dto.ConfirmOrderResponseDTO;
import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.product.dto.ProductStockDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface OrderMapper {

  /** 주문 정보 저장 */
  void insertOrder(OrderDTO orderDTO);

  /** 다음 주문 ID 조회 */
  int getNextOrderId();

  /** 주문 상품 저장 */
  void insertOrderItem(@Param("itemList") List<OrderItemDTO> itemList);

  /** 대기 중인 주문 조회 */
  OrderDTO getOrder(int memberId);

  /** 주문 내역 조회 */
  List<OrderDTO> getOrderList(int memberId, String startDate, String endDate);

  /** 주문 취소 */
  void cancelOrder(@Param("tossOrderId") String tossOrderId,
                   @Param("cancelReason") String cancelReason);

  /** 구매 확정 (SHIPPED → DONE, 본인 주문만) */
  int confirmOrder(@Param("orderId") int orderId,
                   @Param("memberId") int memberId,
                   @Param("confirmedAt") LocalDateTime confirmedAt);

  /**
   * 주문 생성 전 재고 잠금 조회 (FOR UPDATE)
   *
   * 비관적 락으로 동시 주문에 의한 재고 초과를 방지합니다.
   * @param productIds 주문할 상품 ID 목록
   * @return 각 상품의 현재 재고 목록
   */
  List<ProductStockDTO> selectProductStocksForUpdate(@Param("productIds") List<Integer> productIds);

  /**
   * 주문 완료 후 해당 상품을 장바구니에서 제거
   *
   * @param memberId   회원 ID
   * @param productIds 주문한 상품 ID 목록
   */
  void deleteCartItemsByMemberAndProducts(@Param("memberId") int memberId,
                                          @Param("productIds") List<Integer> productIds);
}