package com.farmtech.smartfarm.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.Message;

@Slf4j
@Service
public class FcmService {

  /**
   *
   * @param fcmToken 수신 디바이스 FCM 토큰
   * @param title    알림 제목
   * @param body     알림 내용
   */
  public  void sendToDevice(String fcmToken,String title, String body){
    if(fcmToken == null || fcmToken.isBlank()) return;

    Message message = Message.builder()
            .setToken(fcmToken)
            .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
            .build();

    try {
      FirebaseMessaging.getInstance().send(message);
      log.info("[FCM] 발송 성공");
    } catch (FirebaseMessagingException e) {
      log.error("[FCM] 발송 실패 : {}", e.getMessage());
    }
  }
}
