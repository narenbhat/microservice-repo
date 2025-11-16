package com.videochat.service;

import com.videochat.model.Room;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    // Configuration constants
    private static final int MAX_PARTICIPANTS_PER_ROOM = 50;
    private static final int MAX_ROOMS_TOTAL = 1000;
    private static final long ROOM_IDLE_TIMEOUT_MINUTES = 30;
    private static final long EMPTY_ROOM_CLEANUP_MINUTES = 5;

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final Map<String, Instant> roomLastActivity = new ConcurrentHashMap<>();

    public Room createRoom(String name) throws IllegalStateException {
        // Check if maximum number of rooms reached
        if (rooms.size() >= MAX_ROOMS_TOTAL) {
            logger.warn("Maximum number of rooms ({}) reached, cannot create new room", MAX_ROOMS_TOTAL);
            throw new IllegalStateException("Maximum number of rooms reached. Please try again later.");
        }

        String roomId = UUID.randomUUID().toString();
        Room room = new Room();
        room.setId(roomId);
        room.setName(sanitizeRoomName(name));
        room.setParticipants(new HashSet<>());
        room.setCreatedAt(System.currentTimeMillis());
        room.setMaxParticipants(MAX_PARTICIPANTS_PER_ROOM);

        rooms.put(roomId, room);
        roomLastActivity.put(roomId, Instant.now());

        logger.info("Room created: {} (ID: {})", room.getName(), roomId);
        return room;
    }

    private String sanitizeRoomName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "Untitled Room";
        }
        // Remove potentially harmful characters and limit length
        return name.trim().replaceAll("[<>\"']", "").substring(0, Math.min(name.length(), 100));
    }

    public Optional<Room> getRoom(String roomId) {
        if (roomId == null || roomId.trim().isEmpty()) {
            return Optional.empty();
        }

        Room room = rooms.get(roomId);
        if (room != null) {
            updateRoomActivity(roomId);
        }
        return Optional.ofNullable(room);
    }

    public List<Room> getAllRooms() {
        // Only return active rooms (non-empty or recently created)
        return rooms.values().stream()
                .filter(room -> !room.getParticipants().isEmpty() ||
                        isRoomRecentlyCreated(room.getId()))
                .collect(Collectors.toList());
    }

    public Optional<Room> addParticipant(String roomId, String userId) {
        if (roomId == null || userId == null || userId.trim().isEmpty()) {
            logger.warn("Invalid roomId or userId provided");
            return Optional.empty();
        }

        Room room = rooms.get(roomId);
        if (room == null) {
            logger.warn("Attempted to add participant to non-existent room: {}", roomId);
            return Optional.empty();
        }

        // Check room capacity
        if (room.getParticipants().size() >= MAX_PARTICIPANTS_PER_ROOM) {
            logger.warn("Room {} is at maximum capacity ({})", roomId, MAX_PARTICIPANTS_PER_ROOM);
            throw new IllegalStateException("Room is at maximum capacity");
        }

        // Check if user is already in the room
        if (room.getParticipants().contains(userId)) {
            logger.info("User {} is already in room {}", userId, roomId);
            return Optional.of(room);
        }

        room.getParticipants().add(userId);
        updateRoomActivity(roomId);

        logger.info("Participant {} added to room {} (Total: {})",
                userId, roomId, room.getParticipants().size());

        return Optional.of(room);
    }

    public Optional<Room> removeParticipant(String roomId, String userId) {
        if (roomId == null || userId == null) {
            return Optional.empty();
        }

        Room room = rooms.get(roomId);
        if (room != null) {
            boolean removed = room.getParticipants().remove(userId);
            if (removed) {
                updateRoomActivity(roomId);
                logger.info("Participant {} removed from room {} (Remaining: {})",
                        userId, roomId, room.getParticipants().size());

                // Schedule room cleanup if empty
                if (room.getParticipants().isEmpty()) {
                    logger.info("Room {} is now empty", roomId);
                }
            }
            return Optional.of(room);
        }
        return Optional.empty();
    }

    public void deleteRoom(String roomId) {
        if (roomId == null) {
            return;
        }

        Room room = rooms.remove(roomId);
        roomLastActivity.remove(roomId);

        if (room != null) {
            logger.info("Room deleted: {} (ID: {})", room.getName(), roomId);
        }
    }

    private void updateRoomActivity(String roomId) {
        roomLastActivity.put(roomId, Instant.now());
    }

    private boolean isRoomRecentlyCreated(String roomId) {
        Instant lastActivity = roomLastActivity.get(roomId);
        if (lastActivity == null) {
            return false;
        }
        return Duration.between(lastActivity, Instant.now()).toMinutes() < 5;
    }

    // Scheduled cleanup of idle and empty rooms
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void cleanupIdleRooms() {
        Instant now = Instant.now();
        List<String> roomsToDelete = new ArrayList<>();

        for (Map.Entry<String, Room> entry : rooms.entrySet()) {
            String roomId = entry.getKey();
            Room room = entry.getValue();
            Instant lastActivity = roomLastActivity.get(roomId);

            if (lastActivity == null) {
                continue;
            }

            long minutesSinceActivity = Duration.between(lastActivity, now).toMinutes();

            // Delete empty rooms after EMPTY_ROOM_CLEANUP_MINUTES
            if (room.getParticipants().isEmpty() &&
                minutesSinceActivity >= EMPTY_ROOM_CLEANUP_MINUTES) {
                roomsToDelete.add(roomId);
                logger.info("Marking empty room {} for deletion (idle for {} minutes)",
                        roomId, minutesSinceActivity);
            }
            // Delete idle rooms with participants after ROOM_IDLE_TIMEOUT_MINUTES
            else if (!room.getParticipants().isEmpty() &&
                     minutesSinceActivity >= ROOM_IDLE_TIMEOUT_MINUTES) {
                roomsToDelete.add(roomId);
                logger.info("Marking idle room {} for deletion (idle for {} minutes)",
                        roomId, minutesSinceActivity);
            }
        }

        // Perform deletion
        for (String roomId : roomsToDelete) {
            deleteRoom(roomId);
        }

        if (!roomsToDelete.isEmpty()) {
            logger.info("Cleaned up {} idle/empty rooms", roomsToDelete.size());
        }
    }

    // Statistics and monitoring
    public Map<String, Object> getRoomStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRooms", rooms.size());
        stats.put("activeRooms", rooms.values().stream()
                .filter(room -> !room.getParticipants().isEmpty())
                .count());
        stats.put("totalParticipants", rooms.values().stream()
                .mapToInt(room -> room.getParticipants().size())
                .sum());
        stats.put("maxRooms", MAX_ROOMS_TOTAL);
        stats.put("maxParticipantsPerRoom", MAX_PARTICIPANTS_PER_ROOM);

        return stats;
    }

    public boolean isRoomAtCapacity(String roomId) {
        Room room = rooms.get(roomId);
        return room != null && room.getParticipants().size() >= MAX_PARTICIPANTS_PER_ROOM;
    }

    public int getRoomParticipantCount(String roomId) {
        Room room = rooms.get(roomId);
        return room != null ? room.getParticipants().size() : 0;
    }
}
