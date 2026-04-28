package com.farmtech.smartfarm.chat.interceptor;

import com.farmtech.smartfarm.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatChannelInterceptor implements ChannelInterceptor {

  private final JwtUtil jwtUtil;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
      String authorization = accessor.getFirstNativeHeader("Authorization");
      if (authorization != null && authorization.startsWith("Bearer ")) {
        String token = authorization.substring(7);
        try {
          if (!jwtUtil.isExpired(token)) {
            int memberId = jwtUtil.getMemberId(token);
            String role = jwtUtil.getRole(token);
            accessor.getSessionAttributes().put("memberId", memberId);
            accessor.getSessionAttributes().put("role", role);
            log.info("[WS] 연결 인증 성공 - memberId: {}", memberId);
          }
        } catch (Exception e) {
          log.warn("[WS] 토큰 검증 실패: {}", e.getMessage());
        }
      }
    }
    return message;
  }
}