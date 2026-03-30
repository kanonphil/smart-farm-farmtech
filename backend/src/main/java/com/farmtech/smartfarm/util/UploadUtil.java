package com.farmtech.smartfarm.util;

import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class UploadUtil {

  @Value("${file.upload.dir}")
  private String uploadPath;

  // 단일 파일 업로드 (대표 이미지)
  public ProductImageDTO fileUpload(MultipartFile mainImgFile) {
    ProductImageDTO imgInfo = null;

    if (mainImgFile != null && !mainImgFile.isEmpty()) {
      imgInfo = new ProductImageDTO();

      String originFileName = mainImgFile.getOriginalFilename();
      String uuid = UUID.randomUUID().toString();
      String extension = originFileName.substring(originFileName.lastIndexOf("."));
      String uploadFileName = uuid + extension;

      File file = new File(uploadPath + uploadFileName);

      try {
        mainImgFile.transferTo(file);

        imgInfo.setImageOriginName(originFileName);
        imgInfo.setImageSavedName(uploadFileName);
        imgInfo.setImageType("MAIN");
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }

    return imgInfo;
  }

  // 다중 파일 업로드 (상세 이미지)
  public List<ProductImageDTO> multipleFileUpload(MultipartFile[] subImgs) {
    List<ProductImageDTO> list = new ArrayList<>();

    for (int i = 0; i < subImgs.length; i++) {
      ProductImageDTO dto = fileUpload(subImgs[i]);
      if (dto != null) {
        dto.setImageType("SUB");
        dto.setImageOrder(i + 1);
        list.add(dto);
      }
    }

    return list;
  }

}
