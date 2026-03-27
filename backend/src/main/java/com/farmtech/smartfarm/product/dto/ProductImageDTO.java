package com.farmtech.smartfarm.product.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
public class ProductImageDTO {
  private int imageId;
  private int productId;
  private String imageOriginName;
  private String imageSavedName;
  private String imageType;
  private int imageOrder;
}
