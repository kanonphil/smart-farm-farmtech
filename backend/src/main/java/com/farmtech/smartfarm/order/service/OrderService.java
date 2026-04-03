package com.farmtech.smartfarm.order.service;

import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.order.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderMapper orderMapper;

  //주문 정보 및 상품 저장 기능
  @Transactional
  public void insertOrder( OrderDTO orderDTO, List<OrderItemDTO> itemList, int memberId){
    int orderId = orderMapper.getNextOrderId();
    orderDTO.setMemberId(memberId);
    orderDTO.setOrderId(orderId);
    for(OrderItemDTO e : itemList){
      e.setOrderId(orderId);
    }
    orderMapper.insertOrder(orderDTO);
    orderMapper.insertOrderItem(itemList);

  }
}
