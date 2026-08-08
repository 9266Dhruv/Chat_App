package com.chatapp.service;

import com.chatapp.dto.*;
import com.chatapp.entity.*;
import com.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, Long beforeId, int limit) {
        List<Message> messages;
        PageRequest page = PageRequest.of(0, limit);

        if (beforeId != null) {
            messages = messageRepository.findByConversationIdAndIdLessThanOrderByCreatedAtDesc(
                conversationId, beforeId, page);
        } else {
            messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId, page);
        }

        return messages.stream()
            .map(m -> MessageResponse.from(m, reactionRepository.findByMessageId(m.getId())))
            .toList();
    }

    @Transactional
    public MessageResponse sendMessage(Long conversationId, MessageRequest request, Long senderId) {
        // Idempotency check
        Optional<Message> existing = messageRepository.findByClientMessageId(request.getClientMessageId());
        if (existing.isPresent()) {
            Message msg = existing.get();
            return MessageResponse.from(msg, reactionRepository.findByMessageId(msg.getId()));
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message msg = Message.builder()
                .conversationId(conversationId)
                .sender(sender)
                .content(request.getContent())
                .clientMessageId(request.getClientMessageId())
                .status("SENT")
                .build();

        if (request.getReplyToId() != null) {
            messageRepository.findById(request.getReplyToId()).ifPresent(msg::setReplyTo);
        }

        msg = messageRepository.save(msg);
        MessageResponse response = MessageResponse.from(msg, new ArrayList<>());

        // Broadcast to conversation topic
        messagingTemplate.convertAndSend("/topic/conv/" + conversationId, response);

        return response;
    }

    @Transactional
    public MessageResponse sendMessageWithFile(Long conversationId, MessageRequest request,
                                                Long senderId, String fileUrl) {
        Optional<Message> existing = messageRepository.findByClientMessageId(request.getClientMessageId());
        if (existing.isPresent()) {
            Message msg = existing.get();
            return MessageResponse.from(msg, reactionRepository.findByMessageId(msg.getId()));
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message msg = Message.builder()
                .conversationId(conversationId)
                .sender(sender)
                .content(request.getContent())
                .fileUrl(fileUrl)
                .clientMessageId(request.getClientMessageId())
                .status("SENT")
                .build();

        if (request.getReplyToId() != null) {
            messageRepository.findById(request.getReplyToId()).ifPresent(msg::setReplyTo);
        }

        msg = messageRepository.save(msg);
        MessageResponse response = MessageResponse.from(msg, new ArrayList<>());

        messagingTemplate.convertAndSend("/topic/conv/" + conversationId, response);
        return response;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!msg.getSender().getId().equals(userId)) {
            throw new RuntimeException("Cannot delete another user's message");
        }

        Long convId = msg.getConversationId();
        messageRepository.delete(msg);

        // Broadcast delete event
        Map<String, Object> deleteEvent = new HashMap<>();
        deleteEvent.put("type", "MESSAGE_DELETED");
        deleteEvent.put("messageId", messageId);
        messagingTemplate.convertAndSend("/topic/conv/" + convId, deleteEvent);
    }

    @Transactional
    public MessageResponse toggleReaction(Long messageId, String emoji, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Reaction> existing = reactionRepository.findByMessageIdAndUserIdAndEmoji(
            messageId, userId, emoji);

        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
        } else {
            Reaction reaction = Reaction.builder()
                    .message(msg)
                    .user(user)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(reaction);
        }

        List<Reaction> reactions = reactionRepository.findByMessageId(messageId);
        MessageResponse response = MessageResponse.from(msg, reactions);

        // Broadcast reaction update
        messagingTemplate.convertAndSend("/topic/conv/" + msg.getConversationId(), response);
        return response;
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!"READ".equals(msg.getStatus())) {
            msg.setStatus("READ");
            messageRepository.save(msg);
        }
    }

    public void broadcastTyping(TypingEvent event) {
        messagingTemplate.convertAndSend(
            "/topic/conv/" + event.getConversationId() + "/typing", event);
    }
}
