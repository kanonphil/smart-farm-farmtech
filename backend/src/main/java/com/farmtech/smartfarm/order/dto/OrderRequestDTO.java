package com.farmtech.smartfarm.order.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Setter
@Getter
@ToString
public class OrderRequestDTO {
  private OrderDTO orderDTO;
  private List<OrderItemDTO> orderItemDTOList;
}
