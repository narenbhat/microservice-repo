import React, { useState, useEffect } from 'react';
import { roomAPI } from '../services/api';
import '../styles/RoomList.css';

function RoomList({ userName, onJoinRoom }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomAPI.getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setLoading(true);
    try {
      const room = await roomAPI.createRoom(newRoomName);
      setRooms([...rooms, room]);
      setNewRoomName('');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room) => {
    try {
      await roomAPI.joinRoom(room.id, userName);
      onJoinRoom(room);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room');
    }
  };

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h1>Video Chat Rooms</h1>
        <p className="welcome-text">Welcome, {userName}!</p>
      </div>

      <form onSubmit={handleCreateRoom} className="create-room-form">
        <input
          type="text"
          placeholder="Enter room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="room-input"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>

      <div className="rooms-grid">
        {rooms.length === 0 ? (
          <p className="no-rooms">No rooms available. Create one to get started!</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <h3>{room.name}</h3>
              <p className="participants-count">
                {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => handleJoinRoom(room)}
                className="btn-join"
              >
                Join Room
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomList;
