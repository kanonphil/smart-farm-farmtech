package com.farmtech.smartfarm.order.controller;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
import com.farmtech.smartfarm.order.dto.ConfirmOrderResponseDTO;
import com.farmtech.smartfarm.order.dto.OrderDTO;
import com.farmtech.smartfarm.order.dto.OrderItemDTO;
import com.farmtech.smartfarm.order.dto.OrderRequestDTO;
import com.farmtech.smartfarm.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
  private final OrderService orderService;

  //주문 목록 및 상품 저장 api
  @PostMapping("")
  public ResponseEntity<?> insertOrder(@RequestBody OrderRequestDTO orderRequestDTO, @AuthenticationPrincipal CustomUserDetails userDetails){
    try {
      OrderDTO orderDTO = orderRequestDTO.getOrderDTO();
      List<OrderItemDTO> orderItemDTOList = orderRequestDTO.getOrderItemDTOList();

      int memberId = userDetails.getMemberDTO().getMemberId();
      String tossOrderId = orderService.insertOrder(orderDTO, orderItemDTOList, memberId);

      return ResponseEntity.ok(Map.of("tossOrderId", tossOrderId));
    }catch (Exception e){
      log.error("주문 저장 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  // 결제 전 주문 취소 api (READY → CANCELLED)
  @PatchMapping("/cancel")
  public ResponseEntity<?> cancelOrder(@RequestParam String tossOrderId) {
    try {
      orderService.cancelOrder(tossOrderId);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      log.error("주문 취소 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //주문 정보 조회 api
  @GetMapping("")
  public ResponseEntity<?> getOrder(@AuthenticationPrincipal CustomUserDetails userDetails){
    try {
      int memberId = userDetails.getMemberDTO().getMemberId();
      OrderDTO orderDTO = orderService.getOrder(memberId);
      return ResponseEntity.status(HttpStatus.OK).body(orderDTO);
    }catch (Exception e){
      log.error("주문 정보 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //내 주문 내역 조회 api
  @GetMapping("/list")
  public ResponseEntity<?> getOrderList(@RequestParam String startDate, @RequestParam String endDate, @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      int memberId = userDetails.getMemberDTO().getMemberId();
      List<OrderDTO> orderList = orderService.getOrderList(memberId, startDate, endDate);
      return ResponseEntity.status(HttpStatus.OK).body(orderList);
    } catch (Exception e) {
      log.error("주문 내역 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * 회원 구매 확정 API
   * PATCH /orders/{orderId}/confirm
   *
   * @param orderId     구매 확정할 주문 ID
   * @param userDetails 로그인 회원 정보
   */
  @PatchMapping("/{orderId}/confirm")
  public ResponseEntity<?> confirmOrder(
          @PathVariable int orderId,
          @AuthenticationPrincipal CustomUserDetails userDetails
  ) {
    try {
      int memberId = userDetails.getMemberDTO().getMemberId();
      ConfirmOrderResponseDTO response = orderService.confirmOrder(orderId, memberId);
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      log.error("구매 확정 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("구매 확정 처리 중 오류가 발생했습니다.");
    }
  }

}
