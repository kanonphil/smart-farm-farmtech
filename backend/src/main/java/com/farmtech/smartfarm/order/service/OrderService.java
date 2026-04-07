package com.farmtech.smartfarm.order.service;

import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.order.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
