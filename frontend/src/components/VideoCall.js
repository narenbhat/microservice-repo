import React, { useState, useEffect, useRef } from 'react';
import webRTCService from '../services/webrtc';
import webSocketService from '../services/websocket';
import { roomAPI } from '../services/api';
import Chat from './Chat';
import '../styles/VideoCall.css';

function VideoCall({ room, userName, onLeaveRoom }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]);

  const localVideoRef = useRef(null);
  const userId = useRef(userName + '-' + Date.now());

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Connect WebSocket
      webSocketService.connect(() => {
        // Join room
        webSocketService.joinRoom(room.id, userId.current);

        // Subscribe to room signals
        webSocketService.subscribeToRoom(room.id, handleRoomMessage);
        webSocketService.subscribeToSignal(userId.current, handleSignalMessage);
      });

      // Get local media stream
      const stream = await webRTCService.getLocalStream();
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Set up WebRTC callbacks
      webRTCService.onRemoteStream((peerId, stream) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(peerId, stream);
          return newMap;
        });
      });

      webRTCService.onRemoteStreamRemoved((peerId) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
      });

      // Join room via API
      await roomAPI.joinRoom(room.id, userId.current);
    } catch (error) {
      console.error('Error initializing call:', error);
      alert('Failed to access camera/microphone');
    }
  };

  const handleRoomMessage = (message) => {
    if (message.type === 'join' && message.from !== userId.current) {
      // New user joined, create offer
      const sendSignal = (signal) => {
        webSocketService.sendSignal({
          ...signal,
          from: userId.current,
          roomId: room.id
        });
      };
      webRTCService.createOffer(message.from, sendSignal);
    } else if (message.type === 'leave') {
      webRTCService.removePeerConnection(message.from);
    }
  };

  const handleSignalMessage = async (message) => {
    const sendSignal = (signal) => {
      webSocketService.sendSignal({
        ...signal,
        from: userId.current,
        roomId: room.id
      });
    };

    switch (message.type) {
      case 'offer':
        await webRTCService.handleOffer(message.from, message.data, sendSignal);
        break;
      case 'answer':
        await webRTCService.handleAnswer(message.from, message.data);
        break;
      case 'ice-candidate':
        await webRTCService.handleIceCandidate(message.from, message.data);
        break;
      default:
        break;
    }
  };

  const cleanup = async () => {
    webSocketService.leaveRoom(room.id, userId.current);
    await roomAPI.leaveRoom(room.id, userId.current);
    webRTCService.cleanup();
    webSocketService.disconnect();
  };

  const handleLeave = async () => {
    await cleanup();
    onLeaveRoom();
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    webRTCService.toggleAudio(!newMutedState);
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    webRTCService.toggleVideo(!newVideoState);
  };

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <h2>{room.name}</h2>
        <button onClick={handleLeave} className="btn-leave">
          Leave Call
        </button>
      </div>

      <div className="video-grid">
        <div className="video-container local-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-element"
          />
          <div className="video-label">You ({userName})</div>
        </div>

        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
          <RemoteVideo key={peerId} stream={stream} peerId={peerId} />
        ))}
      </div>

      <div className="controls">
        <button
          onClick={toggleMute}
          className={`control-btn ${isMuted ? 'active' : ''}`}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        <button
          onClick={toggleVideo}
          className={`control-btn ${isVideoOff ? 'active' : ''}`}
        >
          {isVideoOff ? '📹 Start Video' : '📹 Stop Video'}
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className="control-btn"
        >
          💬 {showChat ? 'Hide' : 'Show'} Chat
        </button>
      </div>

      {showChat && (
        <Chat
          roomId={room.id}
          userName={userName}
          userId={userId.current}
        />
      )}
    </div>
  );
}

function RemoteVideo({ stream, peerId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-container remote-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-element"
      />
      <div className="video-label">{peerId.split('-')[0]}</div>
    </div>
  );
}

export default VideoCall;
