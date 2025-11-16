package com.videochat.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private String id;
    private String name;
    private Set<String> participants = new HashSet<>();
    private long createdAt;
    private int maxParticipants;
    private boolean isLocked;
    private String hostId;
}
