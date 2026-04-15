import { io } from 'socket.io-client';

let socket = null;

const SOCKET_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SOCKET_URL)
    ? process.env.NEXT_PUBLIC_SOCKET_URL
    : 'http://localhost:3000';

export function connect(token) {
  if (typeof window === 'undefined') return null;

  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.connect();
  return socket;
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export default { connect, disconnect, getSocket };
