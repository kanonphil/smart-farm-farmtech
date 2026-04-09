package com.farmtech.smartfarm.dashboard.mapper;

import com.farmtech.smartfarm.dashboard.dto.DashboardDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper


public interface DashboardMapper {
  //금일, 전일 회원 수 조회 메서드
  DashboardDTO getTodayMember();

  //전체 회원 수 조회 메서드
  DashboardDTO getTotalMember();

  //금일, 전일 매출 조회 메서드
  DashboardDTO getTodaySales();

  //금일, 전일 주문 수 조회
  DashboardDTO getTodayOrder();

  //해당 연도에 월별 매출 조회
  List<DashboardDTO> getMonthSales(int year);

  //주문 상태 조회 메서드
  DashboardDTO getOrderStatus();

  //회원 별 구매순위 탑 10 메서드
  List<DashboardDTO> getMemberRank();

  //상품별 탑 5 메서드
  List<DashboardDTO> getProductRank();
}



