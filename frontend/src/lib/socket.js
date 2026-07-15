import { io } from 'socket.io-client';
import { API_URL, getToken } from './api';

let socket = null;

/* Admin realtime connection — authenticates the socket with the JWT.
   The server only adds ADMIN sockets to the broadcast room. */
export function connectAdminSocket() {
  if (socket?.connected) return socket;
  socket = io(API_URL, { auth: { token: getToken() }, transports: ['websocket', 'polling'] });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
