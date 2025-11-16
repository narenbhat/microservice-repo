const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.localStream = null;
    this.onRemoteStreamCallback = null;
    this.onRemoteStreamRemovedCallback = null;
  }

  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection(peerId, sendSignal) {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, peerConnection);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(peerId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          to: peerId,
          data: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed') {
        this.removePeerConnection(peerId);
      }
    };

    return peerConnection;
  }

  async createOffer(peerId, sendSignal) {
    const peerConnection = this.peerConnections.get(peerId) ||
                          this.createPeerConnection(peerId, sendSignal);

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      sendSignal({
        type: 'offer',
        to: peerId,
        data: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(peerId, offer, sendSignal) {
    const peerConnection = this.peerConnections.get(peerId) ||
                          this.createPeerConnection(peerId, sendSignal);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      sendSignal({
        type: 'answer',
        to: peerId,
        data: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(peerId, answer) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }

  async handleIceCandidate(peerId, candidate) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    }
  }

  removePeerConnection(peerId) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);

      if (this.onRemoteStreamRemovedCallback) {
        this.onRemoteStreamRemovedCallback(peerId);
      }
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  cleanup() {
    // Close all peer connections
    this.peerConnections.forEach((pc, peerId) => {
      pc.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  onRemoteStreamRemoved(callback) {
    this.onRemoteStreamRemovedCallback = callback;
  }
}

export default new WebRTCService();
