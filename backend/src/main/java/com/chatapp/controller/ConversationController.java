package com.chatapp.controller;

import com.chatapp.dto.*;
import com.chatapp.entity.User;
import com.chatapp.service.ConversationService;
import com.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(conversationService.getUserConversations(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(conversationService.getConversation(id, user.getId()));
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(conversationService.createConversation(request, user.getId()));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Long beforeId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.getMessages(id, beforeId, limit));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long id,
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal User user) {
        if (request.getFileUrl() != null && !request.getFileUrl().trim().isEmpty()) {
            return ResponseEntity.ok(messageService.sendMessageWithFile(id, request, user.getId(), request.getFileUrl()));
        }
        return ResponseEntity.ok(messageService.sendMessage(id, request, user.getId()));
    }
}
