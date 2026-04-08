package com.farmtech.smartfarm.order.controller;

import com.farmtech.smartfarm.order.dto.ManagerOrderDTO;
import com.farmtech.smartfarm.order.dto.ShippingStartResponseDTO;
import com.farmtech.smartfarm.order.service.ManagerOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * 관리자 주문 관리 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/manager/orders")
@RequiredArgsConstructor
public class ManagerOrderController {
  private final ManagerOrderService managerOrderService;

  /**
   * 관리자 전체 주문 목록 조회
   * GET /manager/orders
   */
  @GetMapping("")
  public ResponseEntity<?> getManagerOrderList() {
    try {
      List<ManagerOrderDTO> list = managerOrderService.getManagerOrderList();
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      log.error("관리자 주문 목록 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body("주문 목록 조회 중 오류가 발생했습니다.");
    }
  }

  /**
   * 배송 시작 처리
   * PATCH /manager/orders/{orderId}/shipping-start
   *
   * @param orderId 배송 시작할 주문 ID
   */
  @PatchMapping("/{orderId}/shipping-start")
  public ResponseEntity<?> startShipping(@PathVariable int orderId) {
    try {
      ShippingStartResponseDTO response = managerOrderService.startShipping(orderId);
      return ResponseEntity.ok(response);
    } catch (NoSuchElementException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      log.error("배송 시작 처리 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("배송 시작 처리 중 오류가 발생했습니다.");
    }
  }
}
