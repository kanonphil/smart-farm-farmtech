package com.farmtech.smartfarm.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 재고 목록 페이지네이션 응답 DTO
 */
@Getter
@AllArgsConstructor
public class StockPageResponseDTO {
  // 현재 페이지 상품 목록
  private List<StockListDTO> content;
  // 전체 상품 수
  private int totalElements;
  // 전체 페이지 수
  private int totalPages;
  // 현재 페이지 번호 (0-based)
  private int page;
  // 페이지 크기
  private int size;
  // 위험 단계 전체 상품 수 (재고 0~9)
  private int dangerCount;
  // 주의 단계 전체 상품 수 (재고 11~49)
  private int warningCount;
  // 안전 단계 전체 상품 수 (재고 50 이상)
  private int safeCount;
}
