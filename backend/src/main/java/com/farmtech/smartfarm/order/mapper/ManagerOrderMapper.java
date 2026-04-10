package com.farmtech.smartfarm.order.mapper;

import com.farmtech.smartfarm.order.dto.ManagerOrderDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 주문 관리 MyBatis Mapper
 */
@Mapper
public interface ManagerOrderMapper {
  /**
   * 관리자용 전체 주문 목록 조회
   * READY, REFUNDED 상태 제외
   *
   * @return 주문 목록
   */
  List<ManagerOrderDTO> selectManagerOrderList();

  /**
   * 주문 단건 조회 (상태 검증용)
   *
   * @param orderId 주문 ID
   * @return 주문 정보
   */
  ManagerOrderDTO selectOrderById(@Param("orderId") int orderId);

  /**
   * 배송 시작 처리 (PAID → SHIPPING)
   *
   * @param orderId             주문 ID
   * @param shippingStartedAt   배송 시작 시각
   * @param expectedDeliveredAt 예상 배송 완료 시각
   * @return 업데이트 행 수
   */
  int updateToShipping(@Param("orderId") int orderId,
                       @Param("shippingStartedAt") LocalDateTime shippingStartedAt,
                       @Param("expectedDeliveredAt") LocalDateTime expectedDeliveredAt);

  /**
   * 배송 완료 자동 처리 대상 조회
   * SHIPPING 상태 중 expectedDeliveredAt이 현재 시각 이전인 주문
   *
   * @param now 현재 시각
   * @return 자동 배송 완료 대상 주문 목록
   */
  List<ManagerOrderDTO> selectAutoShipTargets(@Param("now") LocalDateTime now);

  /**
   * 배송 완료 처리 (SHIPPING → SHIPPED)
   *
   * @param orderId  주문 ID
   * @param shippedAt 배송 완료 처리 시각
   * @return 업데이트 행 수
   */
  int updateToShipped(@Param("orderId") int orderId,
                      @Param("shippedAt") LocalDateTime shippedAt);

  /**
   * 자동 구매 확정 대상 조회
   * SHIPPED 상태 중 paidAt + 7일이 현재 시각 이전인 주문
   *
   * @param now 현재 시각
   * @return 자동 구매 확정 대상 주문 목록
   */
  List<ManagerOrderDTO> selectAutoConfirmTargets(@Param("now") LocalDateTime now);

  /**
   * 구매 확정 처리 (SHIPPED → DONE)
   *
   * @param orderId     주문 ID
   * @param confirmedAt 구매 확정 시각
   * @return 업데이트 행 수
   */
  int updateToDone(@Param("orderId") int orderId,
                   @Param("confirmedAt") LocalDateTime confirmedAt);

  /**
   * 만료된 READY 주문 ID 목록 조회
   * threshold 이전에 생성된 READY 상태 주문 반환
   *
   * @param threshold 만료 기준 시각
   * @return 만료 주문 ID 목록
   */
  List<Integer> selectStaleReadyOrderIds(@Param("threshold") LocalDateTime threshold);

  /**
   * 만료된 READY 주문 삭제
   *
   * @param orderIds 삭제 대상 주문 ID 목록
   * @return 삭제 행 수
   */
  int deleteStaleReadyOrders(@Param("orderIds") List<Integer> orderIds);
}
