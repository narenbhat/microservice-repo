package com.videochat.controller;

import com.videochat.model.SignalingMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignaling(@Payload SignalingMessage message) {
        // Forward WebRTC signaling messages to the appropriate recipient
        if (message.getTo() != null && !message.getTo().isEmpty()) {
            // Send to specific user
            messagingTemplate.convertAndSend("/queue/signal/" + message.getTo(), message);
        } else if (message.getRoomId() != null) {
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
        }
    }

    @MessageMapping("/join")
    public void handleJoin(@Payload SignalingMessage message) {
        // Notify room participants about new user
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
    }

    @MessageMapping("/leave")
    public void handleLeave(@Payload SignalingMessage message) {
        // Notify room participants about user leaving
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
    }
}
