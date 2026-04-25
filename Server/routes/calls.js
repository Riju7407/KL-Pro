const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const callAuth = require('../middleware/callAuth');
const Booking = require('../models/Booking');
const Professional = require('../models/Professional');
const { emitToUser, emitToAdmins } = require('../realtime/presence');
const { getCallSession, upsertCallSession, endCallSession } = require('../services/callSessionService');

const router = express.Router();

const AGORA_APP_ID = String(process.env.AGORA_APP_ID || '').trim();
const AGORA_APP_CERTIFICATE = String(
  process.env.AGORA_APP_CERTIFICATE || process.env.AGORA_PRIMARY_CERTIFICATE || ''
).trim();

const BOOKING_CALL_ALLOWED_STATUSES = ['confirmed', 'in-progress'];

const normalizeMode = (value) => {
  const mode = String(value || '').trim().toLowerCase();
  return mode === 'video' ? 'video' : 'audio';
};

const getBookingContext = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .select('status customerId professionalId')
    .populate('professionalId', 'userId')
    .populate('customerId', 'name')
    .populate({ path: 'professionalId', populate: { path: 'userId', select: 'name' } });

  if (!booking) {
    return { error: { status: 404, message: 'Booking not found' } };
  }

  if (!BOOKING_CALL_ALLOWED_STATUSES.includes(String(booking.status))) {
    return { error: { status: 409, message: 'Audio call is allowed only after booking is accepted and before completion' } };
  }

  const customerUserId = String(booking.customerId?._id || booking.customerId || '');
  const professionalUserId = String(booking.professionalId?.userId?._id || booking.professionalId?.userId || '');

  if (!customerUserId || !professionalUserId) {
    return { error: { status: 400, message: 'Booking participants are invalid for audio calling' } };
  }

  return {
    booking,
    participants: {
      customerUserId,
      professionalUserId,
      customerName: booking.customerId?.name || 'Customer',
      professionalName: booking.professionalId?.userId?.name || 'Professional',
    },
  };
};

const getKycContext = async (professionalId) => {
  const professional = await Professional.findById(professionalId).populate('userId', 'name email approvalStatus');

  if (!professional) {
    return { error: { status: 404, message: 'Professional profile not found' } };
  }

  if (String(professional.approvalStatus) !== 'pending') {
    return {
      error: {
        status: 409,
        message: 'Video KYC is only available while professional verification is pending',
      },
    };
  }

  return {
    professional,
    professionalUserId: String(professional.userId?._id || professional.userId || ''),
    professionalName: professional.userId?.name || 'Professional',
  };
};

const buildRtcUid = (seedValue) => {
  const seed = String(seedValue || '0');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 2147483640) + 1;
};

const buildAgoraToken = (channelName, actorSeed) => {
  const now = Math.floor(Date.now() / 1000);
  const expireAt = now + 60 * 60;
  const uid = buildRtcUid(actorSeed);

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireAt
  );

  return { token, uid, expiresAt: expireAt };
};

router.post('/request', callAuth, async (req, res) => {
  try {
    const { contextType, contextId } = req.body;
    const mode = normalizeMode(req.body.mode);

    if (!['booking', 'kyc'].includes(String(contextType))) {
      return res.status(400).json({ message: 'contextType must be booking or kyc' });
    }

    if (!contextId) {
      return res.status(400).json({ message: 'contextId is required' });
    }

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return res.status(500).json({ message: 'Agora credentials are not configured' });
    }

    if (contextType === 'booking') {
      if (mode !== 'audio') {
        return res.status(400).json({ message: 'Booking call supports audio mode only' });
      }

      if (req.actor.type !== 'user') {
        return res.status(403).json({ message: 'Only customer/professional can start booking audio call' });
      }

      const bookingContext = await getBookingContext(contextId);
      if (bookingContext.error) {
        return res.status(bookingContext.error.status).json({ message: bookingContext.error.message });
      }

      const { participants } = bookingContext;
      const isCustomer = req.actor.userId === participants.customerUserId;
      const isProfessional = req.actor.userId === participants.professionalUserId;

      if (!isCustomer && !isProfessional) {
        return res.status(403).json({ message: 'You are not allowed to start call for this booking' });
      }

      const existing = getCallSession('booking', contextId);
      const channelName = existing?.channelName || `klpro-booking-${contextId}`;

      const session =
        existing ||
        upsertCallSession({
          contextType: 'booking',
          contextId,
          mode: 'audio',
          channelName,
          customerUserId: participants.customerUserId,
          professionalUserId: participants.professionalUserId,
          initiatedBy: {
            type: req.actor.type,
            userId: req.actor.userId,
            role: isCustomer ? 'customer' : 'professional',
          },
        });

      const callerName = isCustomer ? participants.customerName : participants.professionalName;
      const callerRole = isCustomer ? 'customer' : 'professional';
      const calleeUserId = isCustomer ? participants.professionalUserId : participants.customerUserId;

      emitToUser(calleeUserId, 'incoming-call', {
        contextType: 'booking',
        contextId: String(contextId),
        mode: 'audio',
        channelName: session.channelName,
        from: {
          id: req.actor.userId,
          name: callerName,
          role: callerRole,
        },
        at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        contextType: 'booking',
        contextId: String(contextId),
        mode: 'audio',
        channelName: session.channelName,
        appId: AGORA_APP_ID,
      });
    }

    if (mode !== 'video') {
      return res.status(400).json({ message: 'KYC call supports video mode only' });
    }

    const kycContext = await getKycContext(contextId);
    if (kycContext.error) {
      return res.status(kycContext.error.status).json({ message: kycContext.error.message });
    }

    const isProfessionalCaller = req.actor.type === 'user' && req.actor.userType === 'professional' && req.actor.userId === kycContext.professionalUserId;
    const isAdminCaller = req.actor.type === 'admin';

    if (!isProfessionalCaller && !isAdminCaller) {
      return res.status(403).json({ message: 'Only admin and that professional can start KYC video call' });
    }

    const existing = getCallSession('kyc', contextId);
    const channelName = existing?.channelName || `klpro-kyc-${contextId}`;

    const session =
      existing ||
      upsertCallSession({
        contextType: 'kyc',
        contextId,
        mode: 'video',
        channelName,
        professionalUserId: kycContext.professionalUserId,
        initiatedBy: {
          type: req.actor.type,
          userId: req.actor.userId || '',
          adminId: req.actor.adminId || '',
        },
      });

    const from = isAdminCaller
      ? { id: req.actor.adminId || 'admin', name: req.actor.email || 'Admin', role: 'admin' }
      : { id: req.actor.userId, name: req.actor.name || kycContext.professionalName, role: 'professional' };

    const incomingPayload = {
      contextType: 'kyc',
      contextId: String(contextId),
      mode: 'video',
      channelName: session.channelName,
      from,
      at: new Date().toISOString(),
    };

    if (isAdminCaller) {
      emitToUser(kycContext.professionalUserId, 'incoming-call', incomingPayload);
    } else {
      emitToAdmins('incoming-call', incomingPayload);
    }

    return res.json({
      success: true,
      contextType: 'kyc',
      contextId: String(contextId),
      mode: 'video',
      channelName: session.channelName,
      appId: AGORA_APP_ID,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to initiate call request' });
  }
});

router.get('/token', callAuth, async (req, res) => {
  try {
    const contextType = String(req.query.contextType || '').trim();
    const contextId = String(req.query.contextId || '').trim();

    if (!contextType || !contextId) {
      return res.status(400).json({ message: 'contextType and contextId are required' });
    }

    const session = getCallSession(contextType, contextId);
    if (!session) {
      return res.status(404).json({ message: 'Call session not found. Please initiate call first.' });
    }

    if (contextType === 'booking') {
      const bookingContext = await getBookingContext(contextId);
      if (bookingContext.error) {
        endCallSession('booking', contextId, {
          reason: 'booking-not-eligible',
          endedBy: 'system',
        });
        return res.status(bookingContext.error.status).json({ message: bookingContext.error.message });
      }

      if (req.actor.type !== 'user') {
        return res.status(403).json({ message: 'Only booking participants can join this call' });
      }

      const { customerUserId, professionalUserId } = bookingContext.participants;
      if (![customerUserId, professionalUserId].includes(req.actor.userId)) {
        return res.status(403).json({ message: 'You are not allowed to join this booking call' });
      }
    }

    if (contextType === 'kyc') {
      const kycContext = await getKycContext(contextId);
      if (kycContext.error) {
        endCallSession('kyc', contextId, {
          reason: 'kyc-not-eligible',
          endedBy: 'system',
        });
        return res.status(kycContext.error.status).json({ message: kycContext.error.message });
      }

      const isAllowedProfessional =
        req.actor.type === 'user' && req.actor.userType === 'professional' && req.actor.userId === kycContext.professionalUserId;
      const isAllowedAdmin = req.actor.type === 'admin';

      if (!isAllowedProfessional && !isAllowedAdmin) {
        return res.status(403).json({ message: 'Only admin and the requested professional can join this KYC call' });
      }
    }

    const actorSeed = req.actor.type === 'admin' ? req.actor.adminSocketKey : req.actor.userId;
    const builtToken = buildAgoraToken(session.channelName, actorSeed);

    return res.json({
      success: true,
      appId: AGORA_APP_ID,
      channelName: session.channelName,
      mode: session.mode,
      token: builtToken.token,
      uid: builtToken.uid,
      expiresAt: builtToken.expiresAt,
      contextType,
      contextId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate Agora token' });
  }
});

router.post('/end', callAuth, async (req, res) => {
  try {
    const contextType = String(req.body.contextType || '').trim();
    const contextId = String(req.body.contextId || '').trim();
    const reason = String(req.body.reason || '').trim() || 'ended-by-user';

    if (!contextType || !contextId) {
      return res.status(400).json({ message: 'contextType and contextId are required' });
    }

    const session = getCallSession(contextType, contextId);
    if (!session) {
      return res.json({ success: true, message: 'Call already ended' });
    }

    if (contextType === 'booking') {
      if (req.actor.type !== 'user') {
        return res.status(403).json({ message: 'Only booking participants can end this call' });
      }

      const isAllowed = [session.customerUserId, session.professionalUserId].includes(req.actor.userId);
      if (!isAllowed) {
        return res.status(403).json({ message: 'You are not allowed to end this booking call' });
      }
    }

    if (contextType === 'kyc') {
      const isAllowedProfessional =
        req.actor.type === 'user' && req.actor.userType === 'professional' && req.actor.userId === session.professionalUserId;
      const isAllowedAdmin = req.actor.type === 'admin';

      if (!isAllowedProfessional && !isAllowedAdmin) {
        return res.status(403).json({ message: 'You are not allowed to end this KYC call' });
      }
    }

    endCallSession(contextType, contextId, {
      reason,
      endedBy: req.actor.type === 'admin' ? req.actor.email || 'admin' : req.actor.userId,
    });

    return res.json({ success: true, message: 'Call ended successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to end call' });
  }
});

module.exports = router;
