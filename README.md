# Video Chat Application

A full-stack video calling application similar to MS Teams, built with Spring Boot and React. Features real-time video/audio communication, chat messaging, and room-based meetings.

## Features

- **Real-time Video & Audio Calling**: WebRTC-based peer-to-peer video and audio communication
- **Room Management**: Create and join video chat rooms
- **Live Chat**: Send and receive messages during video calls
- **Multiple Participants**: Support for multiple users in the same room
- **Media Controls**: Mute/unmute audio and start/stop video
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Spring Boot 3.2.0
- WebSocket (STOMP)
- Java 17
- Maven

### Frontend
- React 18
- WebRTC API
- SockJS & STOMP WebSocket
- Axios for HTTP requests

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- Modern web browser with WebRTC support

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Enter your name to join the application
3. Create a new room or join an existing one
4. Allow camera and microphone permissions when prompted
5. Start your video call!

### Features in the Call

- **Mute/Unmute**: Click the microphone button to toggle audio
- **Start/Stop Video**: Click the camera button to toggle video
- **Chat**: Click the chat button to open the chat panel and send messages
- **Leave Call**: Click the "Leave Call" button to exit the room

## Architecture

### WebRTC Signaling Flow

1. User joins a room
2. WebSocket connection is established
3. Signaling messages (offer/answer/ICE candidates) are exchanged via WebSocket
4. Peer-to-peer connection is established using WebRTC
5. Media streams are shared between peers

### Backend Components

- **WebSocketConfig**: Configures STOMP WebSocket endpoints
- **SignalingController**: Handles WebRTC signaling messages
- **ChatController**: Manages chat messages
- **RoomController**: REST API for room management
- **RoomService**: Business logic for room operations

### Frontend Components

- **App**: Main application component with user name setup
- **RoomList**: Displays available rooms and allows room creation
- **VideoCall**: Main video calling interface
- **Chat**: Chat panel for messaging
- **webrtc.js**: WebRTC service for managing peer connections
- **websocket.js**: WebSocket service for real-time communication
- **api.js**: HTTP API service for room management

## API Endpoints

### REST API

- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{roomId}` - Get a specific room
- `POST /api/rooms/{roomId}/join?userId={userId}` - Join a room
- `POST /api/rooms/{roomId}/leave?userId={userId}` - Leave a room

### WebSocket Endpoints

- `/ws` - WebSocket connection endpoint
- `/app/signal` - Send signaling messages
- `/app/chat.send` - Send chat messages
- `/app/join` - Join room notification
- `/app/leave` - Leave room notification
- `/topic/room/{roomId}` - Subscribe to room events
- `/topic/room/{roomId}/chat` - Subscribe to room chat
- `/queue/signal/{userId}` - Subscribe to personal signals

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
spring.application.name=video-chat-app
logging.level.org.springframework.web=INFO
logging.level.com.videochat=DEBUG
```

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:8080` via the `proxy` setting in `package.json`.

## Troubleshooting

### Camera/Microphone Access Issues
- Make sure your browser has permission to access camera and microphone
- Check if another application is using your camera
- Try using HTTPS in production (WebRTC requires secure context)

### Connection Issues
- Ensure both backend and frontend servers are running
- Check if ports 8080 and 3000 are not blocked by firewall
- Verify WebSocket connection in browser console

### Video Not Showing
- Check browser console for WebRTC errors
- Ensure STUN servers are accessible
- Try refreshing the page and rejoining the room

## Production Deployment

### Backend

1. Build the JAR file:
```bash
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/video-chat-app-1.0.0.jar
```

### Frontend

1. Build the production bundle:
```bash
npm run build
```

2. Serve the `build` folder using a web server (Nginx, Apache, etc.)

### Additional Considerations

- Use HTTPS for production (WebRTC requirement)
- Configure TURN servers for NAT traversal in production
- Set up proper CORS configuration
- Implement authentication and authorization
- Add rate limiting and security measures

## Future Enhancements

- Screen sharing capability
- Recording functionality
- User authentication and authorization
- Persistent room history
- File sharing in chat
- Emoji reactions
- Virtual backgrounds
- Meeting scheduling

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.