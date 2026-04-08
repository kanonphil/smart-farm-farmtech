package com.farmtech.smartfarm.dashboard.service;

import com.farmtech.smartfarm.dashboard.dto.DashboardDTO;
import com.farmtech.smartfarm.dashboard.mapper.DashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
  private final DashboardMapper dashboardMapper;

  //금일, 전일 회원 수 조회 기능
  public DashboardDTO getTodayMember(){
    return dashboardMapper.getTodayMember();
  }

  //전체 회원 수 조회 기능
  public DashboardDTO getTotalMember(){
    return dashboardMapper.getTotalMember();
  }

  //금일, 전일 매출 조회 기능
  public DashboardDTO getTodaySales(){
    return dashboardMapper.getTodaySales();
  }

  //금일, 전일 주문 수 조회 기능
  public DashboardDTO getTodayOrder(){
    return dashboardMapper.getTodayOrder();
  }

  //해당 연도에 월별 매출 조회 기능
  public List<DashboardDTO> getMonthSales(int year){
    return dashboardMapper.getMonthSales(year);
  }
}
