import SockJS from 'sockjs-client';
import { Stomp } from 'stomp-websocket';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.connected = true;
      console.log('WebSocket connected');
      if (onConnected) onConnected();
    }, (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
    });
  }

  subscribeToRoom(roomId, onMessage) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/room/${roomId}`,
      (message) => {
        const parsedMessage = JSON.parse(message.body);
        onMessage(parsedMessage);
      }
    );

    this.subscriptions.set(`room-${roomId}`, subscription);
  }

  subscribeToRoomChat(roomId, onMessage) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/room/${roomId}/chat`,
      (message) => {
        const parsedMessage = JSON.parse(message.body);
        onMessage(parsedMessage);
      }
    );

    this.subscriptions.set(`chat-${roomId}`, subscription);
  }

  subscribeToSignal(userId, onMessage) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/queue/signal/${userId}`,
      (message) => {
        const parsedMessage = JSON.parse(message.body);
        onMessage(parsedMessage);
      }
    );

    this.subscriptions.set(`signal-${userId}`, subscription);
  }

  sendSignal(signal) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send('/app/signal', {}, JSON.stringify(signal));
  }

  sendChatMessage(message) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send('/app/chat.send', {}, JSON.stringify(message));
  }

  joinRoom(roomId, userId) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send('/app/join', {}, JSON.stringify({
      type: 'join',
      from: userId,
      roomId: roomId
    }));
  }

  leaveRoom(roomId, userId) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send('/app/leave', {}, JSON.stringify({
      type: 'leave',
      from: userId,
      roomId: roomId
    }));
  }

  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.stompClient.disconnect();
      this.connected = false;
    }
  }
}

export default new WebSocketService();
