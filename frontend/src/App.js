import React, { useState, useEffect } from 'react';
import RoomList from './components/RoomList';
import VideoCall from './components/VideoCall';
import './styles/App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const handleJoinRoom = (room) => {
    setCurrentRoom(room);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameSet(true);
    }
  };

  if (!isNameSet) {
    return (
      <div className="app">
        <div className="name-form-container">
          <h1>Video Chat App</h1>
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="name-input"
            />
            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!currentRoom ? (
        <RoomList userName={userName} onJoinRoom={handleJoinRoom} />
      ) : (
        <VideoCall
          room={currentRoom}
          userName={userName}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
