package com.farmtech.smartfarm.config;

import com.farmtech.smartfarm.chat.interceptor.ChatChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final ChatChannelInterceptor chatChannelInterceptor;

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // React Native는 SockJS 미지원 → 순수 WebSocket
    registry.addEndpoint("/ws/chat")
            .setAllowedOriginPatterns("*");
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic");       // 구독 prefix
    registry.setApplicationDestinationPrefixes("/app"); // 발행 prefix
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(chatChannelInterceptor); // JWT 검증
  }
}