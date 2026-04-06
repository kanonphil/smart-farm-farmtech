package com.farmtech.smartfarm.util;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.farmtech.smartfarm.product.dto.ProductImageDTO;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class UploadUtil {

  // ────────────── AWS 설정값 ──────────────
  @Value("${aws.access-key}")
  private String accessKey;

  @Value("${aws.secret-key}")
  private String secretKey;

  @Value("${aws.bucket-name}")
  private String bucketName;

  @Value("${aws.region}")
  private String region;

  private AmazonS3 s3Client;

  // ────────────── 화이트리스트 (허용 확장자) ──────────────
  private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "webp");

  // ────────────── S3 클라이언트 초기화 ──────────────
  @PostConstruct
  public void init() {
    BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
    s3Client = AmazonS3ClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(credentials))
            .withRegion(region)
            .build();
    log.info("AWS S3 클라이언트 초기화 완료 - bucket: {}", bucketName);
  }

  // ────────────── 파일 유효성 검증 ──────────────

  /**
   * 1. 확장자 화이트리스트 체크
   * 2. 매직바이트(파일 시그니처) 체크 - 확장자를 속인 악성파일 차단
   */
  private void validateFile(MultipartFile file) throws IOException {
    String originName = file.getOriginalFilename();
    if (originName == null || !originName.contains(".")) {
      throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
    }

    // 1. 확장자 화이트리스트 체크
    String extension = originName.substring(originName.lastIndexOf(".") + 1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.contains(extension)) {
      throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + extension
              + " (허용: " + String.join(", ", ALLOWED_EXTENSIONS) + ")");
    }

    // 2. 매직바이트 체크 (실제 파일 데이터가 이미지인지 확인)
    byte[] bytes = file.getBytes();
    if (!isValidMagicBytes(bytes, extension)) {
      throw new IllegalArgumentException("파일 내용이 " + extension + " 형식과 일치하지 않습니다. 위조된 파일일 수 있습니다.");
    }

    log.info("파일 검증 통과 - 파일명: {}, 확장자: {}", originName, extension);
  }

  /**
   * 파일의 첫 바이트(매직바이트/파일 시그니처)로 실제 형식 판별
   *
   * jpg  : FF D8 FF
   * png  : 89 50 4E 47  (‰PNG)
   * gif  : 47 49 46 38  (GIF8)
   * webp : 52 49 46 46  (RIFF) + offset 8: 57 45 42 50 (WEBP)
   */
  private boolean isValidMagicBytes(byte[] bytes, String extension) {
    if (bytes == null || bytes.length < 4) return false;

    return switch (extension) {
      case "jpg", "jpeg" ->
              bytes[0] == (byte) 0xFF &&
              bytes[1] == (byte) 0xD8 &&
              bytes[2] == (byte) 0xFF;
      case "png" ->
              bytes[0] == (byte) 0x89 &&
              bytes[1] == (byte) 0x50 && // P
              bytes[2] == (byte) 0x4E && // N
              bytes[3] == (byte) 0x47;   // G
      case "gif" ->
              bytes[0] == (byte) 0x47 && // G
              bytes[1] == (byte) 0x49 && // I
              bytes[2] == (byte) 0x46 && // F
              bytes[3] == (byte) 0x38;   // 8
      case "webp" ->
              bytes.length >= 12 &&
              bytes[0] == (byte) 0x52 && // R
              bytes[1] == (byte) 0x49 && // I
              bytes[2] == (byte) 0x46 && // F
              bytes[3] == (byte) 0x46 && // F
              bytes[8] == (byte) 0x57 && // W
              bytes[9] == (byte) 0x45 && // E
              bytes[10] == (byte) 0x42 && // B
              bytes[11] == (byte) 0x50;   // P
      default -> false;
    };
  }

  // ────────────── S3 업로드 ──────────────

  /**
   * 단일 파일 업로드 → S3 저장 후 URL 반환
   */
  public ProductImageDTO fileUpload(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) return null;

    validateFile(file);

    String originName = file.getOriginalFilename();
    String extension = originName.substring(originName.lastIndexOf("."));
    String savedName = UUID.randomUUID() + extension;

    ObjectMetadata metadata = new ObjectMetadata();
    metadata.setContentLength(file.getSize());
    metadata.setContentType(file.getContentType());

    s3Client.putObject(new PutObjectRequest(bucketName, savedName, file.getInputStream(), metadata));
    String imageUrl = s3Client.getUrl(bucketName, savedName).toString();

    log.info("S3 업로드 완료 - 원본파일명: {}, S3 URL: {}", originName, imageUrl);

    ProductImageDTO dto = new ProductImageDTO();
    dto.setImageOriginName(originName);
    dto.setImageSavedName(imageUrl);   // 로컬 경로 대신 S3 URL 저장
    dto.setImageType("MAIN");

    return dto;
  }

  /**
   * 다중 파일 업로드 (서브 이미지)
   */
  public List<ProductImageDTO> multipleFileUpload(MultipartFile[] files) throws IOException {
    List<ProductImageDTO> list = new ArrayList<>();

    for (int i = 0; i < files.length; i++) {
      ProductImageDTO dto = fileUpload(files[i]);
      if (dto != null) {
        dto.setImageType("SUB");
        dto.setImageOrder(i + 1);
        list.add(dto);
      }
    }

    return list;
  }
}
