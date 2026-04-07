package com.farmtech.smartfarm.order.controller;

import com.farmtech.smartfarm.member.dto.CustomUserDetails;
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
}
