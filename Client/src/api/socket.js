import { io } from 'socket.io-client';
import API_BASE_URL from '../config/apiConfig';

let socketInstance = null;
let socketToken = '';

export const getSocket = (token = '') => {
  const normalizedToken = String(token || '');

  if (!socketInstance) {
    socketInstance = io(API_BASE_URL.replace('/api', ''), {
      transports: ['websocket'],
      auth: {
        token: normalizedToken,
      },
    });
    socketToken = normalizedToken;
    return socketInstance;
  }

  if (normalizedToken && normalizedToken !== socketToken) {
    socketInstance.auth = { token: normalizedToken };
    socketToken = normalizedToken;
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    socketToken = '';
  }
};
