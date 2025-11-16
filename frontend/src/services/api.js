import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const roomAPI = {
  createRoom: async (roomName) => {
    const response = await axios.post(`${API_BASE_URL}/rooms`, { name: roomName });
    return response.data;
  },

  getAllRooms: async () => {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  },

  getRoom: async (roomId) => {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`);
    return response.data;
  },

  joinRoom: async (roomId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/rooms/${roomId}/join?userId=${userId}`);
    return response.data;
  },

  leaveRoom: async (roomId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/rooms/${roomId}/leave?userId=${userId}`);
    return response.data;
  }
};
