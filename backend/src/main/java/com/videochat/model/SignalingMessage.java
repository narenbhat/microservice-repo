package com.videochat.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignalingMessage {
    private String type; // offer, answer, ice-candidate, join, leave
    private String from;
    private String to;
    private String roomId;
    private Object data; // SDP or ICE candidate data
}
