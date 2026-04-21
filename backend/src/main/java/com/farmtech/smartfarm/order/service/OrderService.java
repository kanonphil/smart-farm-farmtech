package com.farmtech.smartfarm.order.service;

import com.farmtech.smartfarm.order.dto.ConfirmOrderResponseDTO;
import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.order.mapper.OrderMapper;
import com.farmtech.smartfarm.product.dto.ProductStockDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderMapper orderMapper;

  /**
   * 주문 생성
   *
   * 재고 확인 → 주문 저장 → 장바구니 정리를 하나의 트랜잭션으로 처리합니다.
   * FOR UPDATE 로 재고를 잠근 뒤 수량을 검증하므로
   * 동시 주문에 의한 재고 초과를 방지합니다.
   *
   * @throws IllegalArgumentException 재고가 부족한 상품이 있을 때
   */
  @Transactional
  public String insertOrder(OrderDTO orderDTO, List<OrderItemDTO> itemList, int memberId) {
    List<Integer> productIds = itemList.stream()
            .map(OrderItemDTO::getProductId)
            .collect(Collectors.toList());

    // 재고 잠금 조회 (FOR UPDATE) — 트랜잭션이 끝날 때까지 해당 상품 행을 잠금
    List<ProductStockDTO> stocks = orderMapper.selectProductStocksForUpdate(productIds);
    Map<Integer, Integer> stockMap = stocks.stream()
            .collect(Collectors.toMap(ProductStockDTO::getProductId, ProductStockDTO::getProductStock));

    for (OrderItemDTO item : itemList) {
      Integer available = stockMap.get(item.getProductId());
      if (available == null || available < item.getOrderItemQty()) {
        throw new IllegalArgumentException("재고가 부족한 상품이 있습니다.");
      }
    }

    // 주문 저장
    int orderId = orderMapper.getNextOrderId();
    String tossOrderId = "ORDER_" + UUID.randomUUID().toString()
            .replace("-", "").substring(0, 20).toUpperCase();

    orderDTO.setMemberId(memberId);
    orderDTO.setOrderId(orderId);
    orderDTO.setTossOrderId(tossOrderId);
    for (OrderItemDTO e : itemList) {
      e.setOrderId(orderId);
    }
    orderMapper.insertOrder(orderDTO);
    orderMapper.insertOrderItem(itemList);

    // 주문한 상품 장바구니에서 제거
    orderMapper.deleteCartItemsByMemberAndProducts(memberId, productIds);

    return tossOrderId;
  }

  /** 대기 중인 주문 조회 */
  public OrderDTO getOrder(int memberId) {
    return orderMapper.getOrder(memberId);
  }

  /** 주문 내역 조회 */
  public List<OrderDTO> getOrderList(int memberId, String startDate, String endDate) {
    return orderMapper.getOrderList(memberId, startDate, endDate);
  }

  /**
   * 구매 확정 처리 (SHIPPED → DONE)
   * 본인 주문만 가능합니다.
   */
  @Transactional
  public ConfirmOrderResponseDTO confirmOrder(int orderId, int memberId) {
    LocalDateTime now = LocalDateTime.now();
    int result = orderMapper.confirmOrder(orderId, memberId, now);

    if (result != 1) {
      throw new IllegalArgumentException(
              "구매 확정 처리에 실패했습니다. 배송 완료 상태인지, 본인 주문인지 확인해주세요.");
    }

    return new ConfirmOrderResponseDTO(orderId, "DONE", now);
  }
}