package com.farmtech.smartfarm.order.mapper;

import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface OrderMapper {

  // 주문 정보 저장 메서드
  void insertOrder(OrderDTO orderDTO);

  // 주문 id 불러오기 메서드
  int getNextOrderId();

  // 주문 상품 저장 메서드
  void insertOrderItem(List<OrderItemDTO> itemList);

  // 주문 정보 조회 메서드
  OrderDTO getOrder(int memberId);

  // 내 주문 내역 조회 메서드
  List<OrderDTO> getOrderList(int memberId, String startDate, String endDate);

  // 주문 취소 메서드
  void cancelOrder(@Param("tossOrderId") String tossOrderId, @Param("cancelReason") String cancelReason);

  /** 회원 구매 확정 처리 */
  int confirmOrder(@Param("orderId") int orderId,
                   @Param("memberId") int memberId,
                   @Param("confirmedAt") LocalDateTime confirmedAt);

}
