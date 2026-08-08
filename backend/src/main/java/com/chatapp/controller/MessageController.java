package com.chatapp.controller;

import com.chatapp.dto.*;
import com.chatapp.entity.User;
import com.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // WebSocket: send message
    @MessageMapping("/chat.send")
    public void handleSendMessage(@Payload Map<String, Object> payload,
                                   SimpMessageHeaderAccessor headerAccessor) {
        // Extract user from security context (set by JWT filter on WebSocket handshake)
        Principal principal = headerAccessor.getUser();
        // For simplicity, we'll use REST for sending and WebSocket for receiving
        // The WebSocket send is handled in the REST controller + service broadcast
    }

    // WebSocket: typing indicator
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingEvent event) {
        messageService.broadcastTyping(event);
    }

    // REST: delete message
    @DeleteMapping("/api/v1/messages/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        messageService.deleteMessage(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // REST: toggle reaction
    @PostMapping("/api/v1/messages/{id}/reactions")
    public ResponseEntity<MessageResponse> toggleReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.toggleReaction(id, request.getEmoji(), user.getId()));
    }

    // REST: mark as read
    @PostMapping("/api/v1/messages/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        messageService.markAsRead(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
