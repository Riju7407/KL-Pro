const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedSocketToUser = new Map();
const connectedUsersToSockets = new Map();
const onlineProfessionalUsers = new Set();

let ioRef = null;

const emitProfessionalPresence = (userId, isOnline) => {
  if (!ioRef || !userId) return;
  ioRef.emit('professional-presence-changed', {
    userId: String(userId),
    isOnline,
  });
};

const getOnlineProfessionalUserIds = () => {
  return new Set(onlineProfessionalUsers);
};

const emitToUser = (userId, eventName, payload) => {
  if (!ioRef || !userId || !eventName) return;

  const socketIds = connectedUsersToSockets.get(String(userId));
  if (!socketIds || !socketIds.size) return;

  socketIds.forEach((socketId) => {
    ioRef.to(socketId).emit(eventName, payload);
  });
};

const emitGlobal = (eventName, payload) => {
  if (!ioRef || !eventName) return;
  ioRef.emit(eventName, payload);
};

const initPresenceSocket = (io) => {
  ioRef = io;

  io.on('connection', async (socket) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

    if (!token) return;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      if (!decoded?.id) return;

      const user = await User.findById(decoded.id).select('userType');
      if (!user) return;

      connectedSocketToUser.set(socket.id, String(user._id));

      const existingSocketSet = connectedUsersToSockets.get(String(user._id)) || new Set();
      existingSocketSet.add(socket.id);
      connectedUsersToSockets.set(String(user._id), existingSocketSet);

      if (user.userType === 'professional') {
        onlineProfessionalUsers.add(String(user._id));
        emitProfessionalPresence(String(user._id), true);
      }

      socket.on('disconnect', () => {
        const userId = connectedSocketToUser.get(socket.id);
        connectedSocketToUser.delete(socket.id);

        if (!userId) return;

        const userSocketSet = connectedUsersToSockets.get(String(userId));
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (!userSocketSet.size) {
            connectedUsersToSockets.delete(String(userId));
          }
        }

        const stillConnected = Boolean(connectedUsersToSockets.get(String(userId))?.size);

        if (!stillConnected && onlineProfessionalUsers.has(String(userId))) {
          onlineProfessionalUsers.delete(String(userId));
          emitProfessionalPresence(String(userId), false);
        }
      });
    } catch (error) {
      // Ignore invalid token for socket presence.
    }
  });
};

module.exports = {
  initPresenceSocket,
  getOnlineProfessionalUserIds,
  emitToUser,
  emitGlobal,
};
