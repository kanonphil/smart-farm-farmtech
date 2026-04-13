package com.farmtech.smartfarm.dashboard.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DashboardDTO {
  private int todayCount;
  private int yesterdayCount;
  private int lastMonthCount;
  private int totalCount;
  private int todayPrice;
  private int yesterdayPrice;
  private int todayOrders;
  private int yesterdayOrders;
  private int month;
  private int revenue;
  private int paidCount;
  private int shippingCount;
  private int shippedCount;
  private int doneCount;
  private int cancelCount;
  private int totalAmount;
  private int orderCount;
  private String memberName;
  private String productName;
  private int totalQty;
}
