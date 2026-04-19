import { io } from 'socket.io-client';
import API_BASE_URL from '../config/apiConfig';

let socketInstance = null;
let socketToken = '';

const getSocketBaseUrl = () => {
  const normalized = String(API_BASE_URL || '').replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized.slice(0, -4) : normalized;
};

export const getSocket = (token = '') => {
  const normalizedToken = String(token || '');

  if (!socketInstance) {
    socketInstance = io(getSocketBaseUrl(), {
      transports: ['websocket', 'polling'],
      auth: {
        token: normalizedToken,
      },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 20000,
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
