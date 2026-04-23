package com.farmtech.smartfarm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

  @PostConstruct
  public void init() throws IOException {
    // resources 폴더의 서비스 계정 키 파일 읽기
    InputStream serviceAccount =
            getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");

    FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();

    // 중복 초기화 방지
    if (FirebaseApp.getApps().isEmpty()) {
      FirebaseApp.initializeApp(options);
    }
  }
}
