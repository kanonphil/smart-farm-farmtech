package com.farmtech.smartfarm.order.mapper;

import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OrderMapper {

  // 주문 정보 저장 메서드
  void insertOrder(OrderDTO orderDTO);

  // 주문 id 불러오기 메서드
  int getNextOrderId();

  // 주문 상품 저장 메서드
  void insertOrderItem(List<OrderItemDTO> itemList);

  // 주문 정보 조회 기능
  OrderDTO getOrder(int memberId);
}
