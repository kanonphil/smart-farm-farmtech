package com.farmtech.smartfarm.order.service;

import com.farmtech.smartfarm.order.dto.ManagerOrderDTO;
import com.farmtech.smartfarm.order.dto.ShippingStartResponseDTO;
import com.farmtech.smartfarm.order.mapper.ManagerOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * 관리자 주문 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class ManagerOrderService {
  private final ManagerOrderMapper managerOrderMapper;

  /**
   * 관리자 전체 주문 목록 조회
   *
   * @return 주문 목록
   */
  public List<ManagerOrderDTO> getManagerOrderList() {
    return managerOrderMapper.selectManagerOrderList();
  }

  /**
   * 배송 시작 처리
   * PAID 상태 주문만 가능, shippingStartedAt + 2일 = expectedDeliveredAt 저장
   *
   * @param orderId 주문 ID
   * @return 배송 시작 응답 DTO
   */
  @Transactional
  public ShippingStartResponseDTO startShipping(int orderId) {
    // 주문 존재 및 상태 검증
    ManagerOrderDTO order = managerOrderMapper.selectOrderById(orderId);
    if (order == null) {
      throw new NoSuchElementException("존재하지 않는 주문입니다.");
    }
    if (!"PAID".equals(order.getOrderStatus())) {
      throw new IllegalArgumentException("PAID 상태 주문만 배송 시작할 수 있습니다.");
    }

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime expectedDeliveredAt = now.plusDays(2);

    int result = managerOrderMapper.updateToShipping(orderId, now, expectedDeliveredAt);
    if (result != 1) {
      throw new IllegalStateException("배송 시작 처리에 실패했습니다.");
    }

    return new ShippingStartResponseDTO(orderId, "SHIPPING", now, expectedDeliveredAt);
  }
}
