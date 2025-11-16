# Quick Setup Guide

This guide will help you get the video chat application running quickly.

## Step 1: Verify Prerequisites

Make sure you have the following installed:

```bash
# Check Java version (should be 17+)
java -version

# Check Node.js version (should be 16+)
node -v

# Check npm version
npm -v

# Check Maven version
mvn -v
```

If any of these are missing, install them:
- Java: https://adoptium.net/
- Node.js: https://nodejs.org/
- Maven: https://maven.apache.org/install.html

## Step 2: Start the Backend

Open a terminal and run:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Wait for the message: `Started VideoChatApplication in X seconds`

The backend is now running on `http://localhost:8080`

## Step 3: Start the Frontend

Open a NEW terminal (keep the backend running) and run:

```bash
cd frontend
npm install
npm start
```

The browser should automatically open to `http://localhost:3000`

If it doesn't, manually navigate to: http://localhost:3000

## Step 4: Test the Application

1. Enter your name (e.g., "John")
2. Click "Create Room" and name it (e.g., "Test Room")
3. Click "Join Room"
4. Allow camera and microphone access when prompted
5. You should see yourself in the video!

## Testing with Multiple Users

To test with multiple participants:

1. Open the app in a different browser (or incognito window)
2. Enter a different name (e.g., "Jane")
3. Join the same room
4. You should now see both video streams!

## Common Issues

### Port Already in Use

If you get "port 8080 already in use":
```bash
# On Linux/Mac
lsof -ti:8080 | xargs kill -9

# On Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

If you get "port 3000 already in use", the React app will ask if you want to use 3001 instead. Say yes.

### Camera Not Working

- Make sure no other application is using your camera
- Check browser permissions (should see camera icon in address bar)
- Try a different browser (Chrome works best)
- Make sure you're using HTTPS or localhost (WebRTC requirement)

### Connection Issues

If users can't see each other:
- Make sure both backend and frontend are running
- Check browser console for errors (F12)
- Clear browser cache and reload
- Try disabling browser extensions

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐
│   Browser   │         │   Browser   │
│   (User 1)  │         │   (User 2)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │   WebSocket/HTTP      │
       └───────┬───────────────┘
               │
        ┌──────▼──────┐
        │   Backend   │
        │ Spring Boot │
        │   :8080     │
        └─────────────┘
```

1. Users connect via WebSocket for signaling
2. WebRTC establishes peer-to-peer connection
3. Video/audio flows directly between browsers
4. Chat messages go through backend

## Next Steps

- Invite friends to test the app
- Try the chat feature during a call
- Experiment with mute/video controls
- Check out the code to customize it

## Need Help?

Check the main README.md for:
- Detailed architecture information
- API documentation
- Production deployment guide
- Troubleshooting section
