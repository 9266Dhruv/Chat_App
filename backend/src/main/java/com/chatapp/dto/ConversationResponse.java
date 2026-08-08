package com.chatapp.dto;

import com.chatapp.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationResponse {
    private Long id;
    private String title;
    private List<UserResponse> members;
    private MessageResponse lastMessage;
    private String createdAt;

    public static ConversationResponse from(Conversation conv, MessageResponse lastMessage) {
        ConversationResponse r = new ConversationResponse();
        r.setId(conv.getId());
        r.setTitle(conv.getTitle());
        r.setMembers(conv.getMembers().stream()
            .map(UserResponse::from)
            .collect(Collectors.toList()));
        r.setLastMessage(lastMessage);
        r.setCreatedAt(conv.getCreatedAt() != null ? conv.getCreatedAt().toString() : null);
        return r;
    }
}
