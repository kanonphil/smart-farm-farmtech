package com.farmtech.smartfarm.order.service;

import com.farmtech.smartfarm.order.dto.ConfirmOrderResponseDTO;
import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.order.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderMapper orderMapper;

  //주문 정보 및 상품 저장 기능
  @Transactional
  public String insertOrder( OrderDTO orderDTO, List<OrderItemDTO> itemList, int memberId){
    int orderId = orderMapper.getNextOrderId();
    String tossOrderId = "ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();

    orderDTO.setMemberId(memberId);
    orderDTO.setOrderId(orderId);
    orderDTO.setTossOrderId(tossOrderId);

    for(OrderItemDTO e : itemList){
      e.setOrderId(orderId);
    }
    orderMapper.insertOrder(orderDTO);
    orderMapper.insertOrderItem(itemList);

    return tossOrderId;
  }

  //주문 정보 조회 기능
  public OrderDTO getOrder(int memberId){
    return orderMapper.getOrder(memberId);
  }

  //내 주문 내역 조회 기능
  public List<OrderDTO> getOrderList(int memberId, String startDate, String endDate) {
    return orderMapper.getOrderList(memberId, startDate, endDate);
  }

  /**
   * 회원 구매 확정 처리
   * SHIPPED 상태 주문만 가능, 본인 주문만 가능
   *
   * @param orderId  주문 ID
   * @param memberId 요청 회원 ID
   * @return 구매 확정 응답 DTO
   */
  @Transactional
  public ConfirmOrderResponseDTO confirmOrder(int orderId, int memberId) {
    // 구매 확정은 order-mapper의 confirmOrder 쿼리가 memberId + SHIPPED 조건을 함께 검증
    LocalDateTime now = LocalDateTime.now();
    int result = orderMapper.confirmOrder(orderId, memberId, now);

    if (result != 1) {
      // 업데이트 실패 → 본인 주문이 아니거나 SHIPPED 상태가 아님
      throw new IllegalArgumentException("구매 확정 처리에 실패했습니다. 배송 완료 상태인지, 본인 주문인지 확인해주세요.");
    }

    return new ConfirmOrderResponseDTO(orderId, "DONE", now);
  }

}
