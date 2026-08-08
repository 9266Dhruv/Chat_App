package com.chatapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateConversationRequest {
    private String title;
    private List<Long> memberIds;
}
