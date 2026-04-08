package com.farmtech.smartfarm.scheduler;

import com.farmtech.smartfarm.order.dto.ManagerOrderDTO;
import com.farmtech.smartfarm.order.mapper.ManagerOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 주문 상태 자동 전환 스케줄러
 *
 * 1) 배송 완료 자동 처리: SHIPPING → SHIPPED (expectedDeliveredAt 경과 시)
 * 2) 구매 확정 자동 처리: SHIPPED → DONE (paidAt + 7일 경과 시)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderScheduler {

  private final ManagerOrderMapper managerOrderMapper;

  /**
   * 스케줄러 1: 배송 완료 자동 처리
   * 매 시간 정각 실행
   * SHIPPING 상태 중 shippingStartedAt 기준 2일 경과한 주문을 SHIPPED로 변경
   */
  @Scheduled(cron = "0 0 * * * *")
  @Transactional
  public void autoShipOrders() {
    LocalDateTime now = LocalDateTime.now();
    List<ManagerOrderDTO> targets = managerOrderMapper.selectAutoShipTargets(now);

    if (targets.isEmpty()) {
      log.debug("[스케줄러] 배송 완료 처리 대상 없음");
      return;
    }

    log.info("[스케줄러] 배송 완료 자동 처리 시작 - 대상 {}건", targets.size());

    for (ManagerOrderDTO order : targets) {
      try {
        int result = managerOrderMapper.updateToShipped(order.getOrderId(), now);
        if (result == 1) {
          log.info("[스케줄러] 배송 완료 처리 완료 - orderId: {}", order.getOrderId());
        }
      } catch (Exception e) {
        log.error("[스케줄러] 배송 완료 처리 실패 - orderId: {}", order.getOrderId(), e);
      }
    }
  }

  /**
   * 스케줄러 2: 구매 확정 자동 처리
   * 매 시간 30분에 실행 (스케줄러 1과 분산)
   * SHIPPED 상태 중 shippedAt 기준 5일 경과한 주문을 DONE으로 변경
   */
  @Scheduled(cron = "0 30 * * * *")
  @Transactional
  public void autoConfirmOrders() {
    LocalDateTime now = LocalDateTime.now();
    List<ManagerOrderDTO> targets = managerOrderMapper.selectAutoConfirmTargets(now);

    if (targets.isEmpty()) {
      log.debug("[스케줄러] 자동 구매 확정 대상 없음");
      return;
    }

    log.info("[스케줄러] 자동 구매 확정 처리 시작 - 대상 {}건", targets.size());

    for (ManagerOrderDTO order : targets) {
      try {
        int result = managerOrderMapper.updateToDone(order.getOrderId(), now);
        if (result == 1) {
          log.info("[스케줄러] 자동 구매 확정 완료 - orderId: {}", order.getOrderId());
        }
      } catch (Exception e) {
        log.error("[스케줄러] 자동 구매 확정 실패 - orderId: {}", order.getOrderId(), e);
      }
    }
  }
}
