package com.chatapp.dto;

import com.chatapp.entity.Message;
import com.chatapp.entity.Reaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private UserResponse sender;
    private String content;
    private String fileUrl;
    private MessageResponse replyTo;
    private String status;
    private String clientMessageId;
    private String createdAt;
    private List<ReactionGroup> reactions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReactionGroup {
        private String emoji;
        private int count;
        private List<Long> userIds;
    }

    public static MessageResponse from(Message msg, List<Reaction> reactions) {
        MessageResponse r = new MessageResponse();
        r.setId(msg.getId());
        r.setConversationId(msg.getConversationId());
        r.setSender(msg.getSender() != null ? UserResponse.from(msg.getSender()) : null);
        r.setContent(msg.getContent());
        r.setFileUrl(msg.getFileUrl());
        r.setStatus(msg.getStatus());
        r.setClientMessageId(msg.getClientMessageId());
        r.setCreatedAt(msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);

        if (msg.getReplyTo() != null) {
            MessageResponse reply = new MessageResponse();
            reply.setId(msg.getReplyTo().getId());
            reply.setContent(msg.getReplyTo().getContent());
            reply.setSender(msg.getReplyTo().getSender() != null
                ? UserResponse.from(msg.getReplyTo().getSender()) : null);
            reply.setCreatedAt(msg.getReplyTo().getCreatedAt() != null
                ? msg.getReplyTo().getCreatedAt().toString() : null);
            r.setReplyTo(reply);
        }

        if (reactions != null && !reactions.isEmpty()) {
            Map<String, List<Reaction>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getEmoji));
            r.setReactions(grouped.entrySet().stream()
                .map(e -> new ReactionGroup(
                    e.getKey(),
                    e.getValue().size(),
                    e.getValue().stream().map(rx -> rx.getUser().getId()).collect(Collectors.toList())
                ))
                .collect(Collectors.toList()));
        } else {
            r.setReactions(new ArrayList<>());
        }

        return r;
    }
}
