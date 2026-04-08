package com.farmtech.smartfarm.stock.mapper;

import com.farmtech.smartfarm.stock.dto.StockListDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 관리자 재고 관리 MyBatis Mapper
 */
@Mapper
public interface StockMapper {
  /**
   * 재고 목록 조회 (재고 오름차순, 페이지네이션)
   *
   * @param size 페이지 크기
   * @param offset 조회 시작 위치
   * @return 상품 재고 목록
   */
  List<StockListDTO> selectStockList(@Param("size") int size,
                                     @Param("offset") int offset);

  /**
   * 삭제되지 않은 전체 상품 수 조회 (페이지네이션 계산용)
   *
   * @return 전체 상품 수
   */
  int countProducts();

  /**
   * 특정 상품 단건 조회
   *
   * @param productId 상품 ID
   * @return 상품 정보 (없으면 null)
   */
  StockListDTO selectProductById(@Param("productId") int productId);

  /**
   * 상품 재고 수정
   *
   * @param productId 상품 ID
   * @param stock 변경할 재고 수량
   * @return 업데이트된 행 수
   */
  int updateProductStock(@Param("productId") int productId,
                         @Param("stock") int stock);

  /** 위험 단계 상품 수 (재고 0~10) */
  int countDanger();

  /** 주의 단계 상품 수 (재고 11~30) */
  int countWarning();

  /** 안정 단계 상품 수 (재고 31 이상) */
  int countSafe();
}
