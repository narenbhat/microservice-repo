package com.videochat.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String type;
    private String content;
    private String sender;
    private String roomId;
    private long timestamp;
}
