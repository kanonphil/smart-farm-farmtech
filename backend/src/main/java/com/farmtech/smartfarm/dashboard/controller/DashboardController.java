package com.farmtech.smartfarm.dashboard.controller;

import com.farmtech.smartfarm.dashboard.dto.DashboardDTO;
import com.farmtech.smartfarm.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboards")
@Slf4j
@RequiredArgsConstructor
public class DashboardController {
  private final DashboardService dashboardService;

  //금일, 전일 회원 수 조회 api
  @GetMapping("/member-count")
  public ResponseEntity<?> getTodayMember(){
    try {
      DashboardDTO dashboardDTO = dashboardService.getTodayMember();
      return ResponseEntity.status(HttpStatus.OK).body(dashboardDTO);
    }catch (Exception e){
      log.error("금일, 전일 회원 수 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //전체 회원 수 조회 api
  @GetMapping("/member-total")
  public ResponseEntity<?> getTotalMember(){
    try {
      DashboardDTO count = dashboardService.getTotalMember();
      return ResponseEntity.status(HttpStatus.OK).body(count);
    }catch (Exception e){
      log.error("전체 회원 수 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //금일, 전일 매출 조회 기능
  @GetMapping("/price-today")
  public ResponseEntity<?> getTodaySales(){
    try {
      DashboardDTO dashboardDTO = dashboardService.getTodaySales();
      return ResponseEntity.status(HttpStatus.OK).body(dashboardDTO);
    }catch (Exception e){
      log.error("금일, 전일 매출 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //금일, 전일 주문 수 조회 api
  @GetMapping("/order-today")
  public ResponseEntity<?> getTodayOrder(){
    try {
      DashboardDTO dashboardDTO = dashboardService.getTodayOrder();
      return ResponseEntity.status(HttpStatus.OK).body(dashboardDTO);
    }catch (Exception e){
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //해당 연도에 월별 매출 조회 api
  @GetMapping("/sales-month/{year}")
  public ResponseEntity<?> getMonthSales(@PathVariable("year") int year){
    try {
      List<DashboardDTO> dtos = dashboardService.getMonthSales(year);
      return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }catch (Exception e){
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //주문 상태 조회 api
  @GetMapping("/order-status")
  public ResponseEntity<?> getOrderStatus(){
    try {
      DashboardDTO dto = dashboardService.getOrderStatus();
      return ResponseEntity.status(HttpStatus.OK).body(dto);
    }catch (Exception e){
      log.error("주문 상태 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //회원 별 구매순위 탑 10 api
  @GetMapping("/member-rank")
  public ResponseEntity<?> getMemberRank(){
    try {
      List<DashboardDTO> dtos = dashboardService.getMemberRank();
      return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }catch (Exception e){
      log.error("회원 별 구매순위 조회 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  //상품별 탑 5 api
  @GetMapping("/product-rank")
  public ResponseEntity<?> getProductRank(){
    try {
      List<DashboardDTO> dtos = dashboardService.getProductRank();
      return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }catch (Exception e){
      log.error("상품별 탑5 조회 오륲", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
