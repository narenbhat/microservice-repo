package com.videochat.service;

import com.videochat.model.Room;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public Room createRoom(String name) {
        String roomId = UUID.randomUUID().toString();
        Room room = new Room();
        room.setId(roomId);
        room.setName(name);
        room.setParticipants(new HashSet<>());
        room.setCreatedAt(System.currentTimeMillis());
        rooms.put(roomId, room);
        return room;
    }

    public Optional<Room> getRoom(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }

    public List<Room> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    public Optional<Room> addParticipant(String roomId, String userId) {
        Room room = rooms.get(roomId);
        if (room != null) {
            room.getParticipants().add(userId);
            return Optional.of(room);
        }
        return Optional.empty();
    }

    public Optional<Room> removeParticipant(String roomId, String userId) {
        Room room = rooms.get(roomId);
        if (room != null) {
            room.getParticipants().remove(userId);
            return Optional.of(room);
        }
        return Optional.empty();
    }

    public void deleteRoom(String roomId) {
        rooms.remove(roomId);
    }
}
