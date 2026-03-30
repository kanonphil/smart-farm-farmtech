package com.farmtech.smartfarm.payment.mapper;

import com.farmtech.smartfarm.payment.dto.PaymentDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface PaymentMapper {
  PaymentDTO selectOrderByTossOrderId(@Param("orderId") String orderId);
  int updateOrderPaid(@Param("orderId") String orderId,
                      @Param("paymentKey") String paymentKey);
}
