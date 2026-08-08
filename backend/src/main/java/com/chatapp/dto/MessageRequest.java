package com.chatapp.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String content;
    private String clientMessageId;
    private Long replyToId;
    private String fileUrl;
}
