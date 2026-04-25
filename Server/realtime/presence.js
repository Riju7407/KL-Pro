const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedSocketToPrincipal = new Map();
const connectedUsersToSockets = new Map();
const onlineProfessionalUsers = new Set();
const connectedAdminPrincipals = new Set();

let ioRef = null;

const getAdminSocketKey = (adminPayload = {}) => {
  const adminIdentifier = String(adminPayload.email || adminPayload.adminId || '').trim().toLowerCase();
  if (!adminIdentifier) return null;
  return `admin:${adminIdentifier}`;
};

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

const emitToAdmins = (eventName, payload) => {
  if (!eventName) return;
  connectedAdminPrincipals.forEach((adminKey) => {
    emitToUser(adminKey, eventName, payload);
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
      let principalKey = null;
      let professionalUserId = null;

      if (decoded?.role === 'admin') {
        principalKey = getAdminSocketKey(decoded);
        if (!principalKey) return;
        connectedAdminPrincipals.add(principalKey);
      } else if (decoded?.id) {
        const user = await User.findById(decoded.id).select('userType');
        if (!user) return;
        principalKey = String(user._id);
        if (user.userType === 'professional') {
          professionalUserId = String(user._id);
          onlineProfessionalUsers.add(professionalUserId);
          emitProfessionalPresence(professionalUserId, true);
        }
      }

      if (!principalKey) return;

      connectedSocketToPrincipal.set(socket.id, {
        principalKey,
        professionalUserId,
        isAdmin: decoded?.role === 'admin',
      });

      const existingSocketSet = connectedUsersToSockets.get(principalKey) || new Set();
      existingSocketSet.add(socket.id);
      connectedUsersToSockets.set(principalKey, existingSocketSet);

      socket.on('disconnect', () => {
        const meta = connectedSocketToPrincipal.get(socket.id);
        connectedSocketToPrincipal.delete(socket.id);

        if (!meta?.principalKey) return;

        const userSocketSet = connectedUsersToSockets.get(meta.principalKey);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (!userSocketSet.size) {
            connectedUsersToSockets.delete(meta.principalKey);
          }
        }

        if (meta.isAdmin && !connectedUsersToSockets.get(meta.principalKey)?.size) {
          connectedAdminPrincipals.delete(meta.principalKey);
        }

        if (!meta.professionalUserId) return;

        const stillConnected = Boolean(connectedUsersToSockets.get(meta.principalKey)?.size);

        if (!stillConnected && onlineProfessionalUsers.has(meta.professionalUserId)) {
          onlineProfessionalUsers.delete(meta.professionalUserId);
          emitProfessionalPresence(meta.professionalUserId, false);
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
  getAdminSocketKey,
  emitToUser,
  emitToAdmins,
  emitGlobal,
};
