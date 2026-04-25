const { emitToUser, emitToAdmins } = require('../realtime/presence');

const activeCallSessions = new Map();

const getContextKey = (contextType, contextId) => `${String(contextType || '').trim()}:${String(contextId || '').trim()}`;

const getCallSession = (contextType, contextId) => {
  return activeCallSessions.get(getContextKey(contextType, contextId)) || null;
};

const upsertCallSession = (session) => {
  const contextType = String(session?.contextType || '').trim();
  const contextId = String(session?.contextId || '').trim();
  if (!contextType || !contextId) return null;

  const normalized = {
    contextType,
    contextId,
    mode: session.mode,
    channelName: session.channelName,
    customerUserId: session.customerUserId ? String(session.customerUserId) : '',
    professionalUserId: session.professionalUserId ? String(session.professionalUserId) : '',
    initiatedBy: session.initiatedBy || null,
    startedAt: new Date().toISOString(),
  };

  activeCallSessions.set(getContextKey(contextType, contextId), normalized);
  return normalized;
};

const emitCallEnded = (session, details) => {
  const payload = {
    contextType: session.contextType,
    contextId: session.contextId,
    channelName: session.channelName,
    reason: details.reason || 'ended',
    endedBy: details.endedBy || null,
    at: new Date().toISOString(),
  };

  if (session.contextType === 'booking') {
    if (session.customerUserId) emitToUser(session.customerUserId, 'call-ended', payload);
    if (session.professionalUserId) emitToUser(session.professionalUserId, 'call-ended', payload);
    return;
  }

  if (session.contextType === 'kyc') {
    if (session.professionalUserId) emitToUser(session.professionalUserId, 'call-ended', payload);
    emitToAdmins('call-ended', payload);
  }
};

const endCallSession = (contextType, contextId, details = {}) => {
  const key = getContextKey(contextType, contextId);
  const existing = activeCallSessions.get(key);
  if (!existing) return null;

  activeCallSessions.delete(key);
  emitCallEnded(existing, details);
  return existing;
};

module.exports = {
  getCallSession,
  upsertCallSession,
  endCallSession,
};
