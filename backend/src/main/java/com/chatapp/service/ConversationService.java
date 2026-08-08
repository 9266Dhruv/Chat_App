package com.chatapp.service;

import com.chatapp.dto.*;
import com.chatapp.entity.Conversation;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ReactionRepository reactionRepository;

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByMemberId(userId);
        return conversations.stream().map(conv -> {
            MessageResponse lastMsg = messageRepository
                .findTopByConversationIdOrderByCreatedAtDesc(conv.getId())
                .map(m -> MessageResponse.from(m, reactionRepository.findByMessageId(m.getId())))
                .orElse(null);
            return ConversationResponse.from(conv, lastMsg);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conv.getMembers().stream().anyMatch(m -> m.getId().equals(userId));
        if (!isMember) {
            throw new RuntimeException("Access denied");
        }

        MessageResponse lastMsg = messageRepository
            .findTopByConversationIdOrderByCreatedAtDesc(conv.getId())
            .map(m -> MessageResponse.from(m, reactionRepository.findByMessageId(m.getId())))
            .orElse(null);

        return ConversationResponse.from(conv, lastMsg);
    }

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> members = new ArrayList<>();
        members.add(creator);

        for (Long memberId : request.getMemberIds()) {
            if (!memberId.equals(creatorId)) {
                userRepository.findById(memberId).ifPresent(members::add);
            }
        }

        // Prevent duplicate 1-on-1 conversations
        if (members.size() == 2) {
            List<Conversation> existingConvs = conversationRepository.findByMemberId(creatorId);
            for (Conversation c : existingConvs) {
                if (c.getMembers().size() == 2 && c.getMembers().containsAll(members)) {
                    // Return the existing conversation instead of creating a new one
                    MessageResponse lastMsg = messageRepository
                        .findTopByConversationIdOrderByCreatedAtDesc(c.getId())
                        .map(m -> MessageResponse.from(m, reactionRepository.findByMessageId(m.getId())))
                        .orElse(null);
                    return ConversationResponse.from(c, lastMsg);
                }
            }
        }

        Conversation conv = Conversation.builder()
                .title(request.getTitle())
                .members(members)
                .build();

        conv = conversationRepository.save(conv);
        return ConversationResponse.from(conv, null);
    }
}
