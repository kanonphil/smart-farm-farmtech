package com.farmtech.smartfarm.ai.dto;

import com.farmtech.smartfarm.product.dto.ProductListDTO;
import lombok.Data;

import java.util.List;

@Data
public class AiResponseDTO {
  private String recipe;
  private List<ProductListDTO> products;
}
