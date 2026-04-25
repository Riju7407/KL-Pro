import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import API_BASE_URL from '../config/apiConfig';
import { getSocket } from '../api/socket';
import './CallOverlay.css';

const CallContext = createContext({
  activeCall: null,
  incomingCall: null,
  callError: '',
  startBookingAudioCall: async () => {},
  startKycVideoCall: async () => {},
  endCurrentCall: async () => {},
  isCallBusy: false,
});

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

const resolveAuthState = () => {
  const adminToken = localStorage.getItem('adminToken') || '';
  if (adminToken) {
    return {
      token: adminToken,
      role: 'admin',
      displayName: localStorage.getItem('adminEmail') || 'Admin',
    };
  }

  const userToken = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
  const user = parseStoredUser();

  return {
    token: userToken,
    role: user?.userType || 'customer',
    displayName: user?.name || 'User',
  };
};

const normalizeApiPath = (path) => {
  return `${String(API_BASE_URL || '').replace(/\/+$/, '')}/${String(path || '').replace(/^\/+/, '')}`;
};

export function CallProvider({ children }) {
  const location = useLocation();

  const [authState, setAuthState] = useState(resolveAuthState);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callError, setCallError] = useState('');
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const socketRef = useRef(null);
  const rtcClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localVideoContainerRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const ringtoneIntervalRef = useRef(null);

  const isCallBusy = Boolean(activeCall || incomingCall);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      window.clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
  }, []);

  const playBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
      setTimeout(() => audioContext.close().catch(() => {}), 500);
    } catch (error) {
      // Ignore browser audio autoplay restrictions.
    }
  }, []);

  const startRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) return;
    playBeep();
    ringtoneIntervalRef.current = window.setInterval(() => {
      playBeep();
    }, 1300);
  }, [playBeep]);

  const clearAgoraSession = useCallback(async () => {
    const audioTrack = localAudioTrackRef.current;
    const videoTrack = localVideoTrackRef.current;

    if (audioTrack) {
      audioTrack.stop();
      audioTrack.close();
      localAudioTrackRef.current = null;
    }

    if (videoTrack) {
      videoTrack.stop();
      videoTrack.close();
      localVideoTrackRef.current = null;
    }

    if (rtcClientRef.current) {
      try {
        await rtcClientRef.current.leave();
      } catch (error) {
        // Ignore leave failures.
      }
      rtcClientRef.current = null;
    }

    setRemoteUsers([]);
    setIsMuted(false);
    setIsVideoEnabled(true);
  }, []);

  const callApi = useCallback(
    async (path, options = {}) => {
      if (!authState.token) {
        throw new Error('Login required to use calling feature');
      }

      const response = await fetch(normalizeApiPath(path), {
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Call request failed');
      }

      return data;
    },
    [authState.token]
  );

  const joinAgoraCall = useCallback(
    async (callMeta) => {
      setCallError('');

      const tokenResponse = await callApi(
        `/calls/token?contextType=${encodeURIComponent(callMeta.contextType)}&contextId=${encodeURIComponent(
          callMeta.contextId
        )}`
      );

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      rtcClientRef.current = client;

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }

        setRemoteUsers([...client.remoteUsers]);
      });

      client.on('user-unpublished', () => {
        setRemoteUsers([...client.remoteUsers]);
      });

      client.on('user-left', () => {
        setRemoteUsers([...client.remoteUsers]);
      });

      await client.join(
        tokenResponse.appId,
        tokenResponse.channelName,
        tokenResponse.token,
        tokenResponse.uid || null
      );

      if (callMeta.mode === 'video') {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);
      } else {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = null;
        await client.publish([audioTrack]);
      }

      setActiveCall({
        ...callMeta,
        appId: tokenResponse.appId,
        channelName: tokenResponse.channelName,
      });
      setIncomingCall(null);
    },
    [callApi]
  );

  const endCurrentCall = useCallback(
    async (reason = 'ended-by-user') => {
      const target = activeCall || incomingCall;

      stopRingtone();

      if (target?.contextType && target?.contextId && authState.token) {
        try {
          await callApi('/calls/end', {
            method: 'POST',
            body: {
              contextType: target.contextType,
              contextId: target.contextId,
              reason,
            },
          });
        } catch (error) {
          // Keep local cleanup even if API fails.
        }
      }

      await clearAgoraSession();
      setActiveCall(null);
      setIncomingCall(null);
    },
    [activeCall, incomingCall, authState.token, callApi, clearAgoraSession, stopRingtone]
  );

  const requestCall = useCallback(
    async (payload) => {
      const response = await callApi('/calls/request', {
        method: 'POST',
        body: payload,
      });

      await joinAgoraCall({
        contextType: response.contextType,
        contextId: response.contextId,
        mode: response.mode,
        channelName: response.channelName,
        from: {
          name: authState.displayName,
          role: authState.role,
        },
      });
    },
    [callApi, joinAgoraCall, authState.displayName, authState.role]
  );

  const startBookingAudioCall = useCallback(
    async (bookingId) => {
      if (!bookingId) throw new Error('Booking id is required');
      await requestCall({
        contextType: 'booking',
        contextId: bookingId,
        mode: 'audio',
      });
    },
    [requestCall]
  );

  const startKycVideoCall = useCallback(
    async (professionalId) => {
      if (!professionalId) throw new Error('Professional id is required');
      await requestCall({
        contextType: 'kyc',
        contextId: professionalId,
        mode: 'video',
      });
    },
    [requestCall]
  );

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    stopRingtone();
    await joinAgoraCall(incomingCall);
  }, [incomingCall, joinAgoraCall, stopRingtone]);

  const declineIncomingCall = useCallback(async () => {
    await endCurrentCall('declined');
  }, [endCurrentCall]);

  const toggleMute = useCallback(async () => {
    if (!localAudioTrackRef.current) return;
    const nextMuted = !isMuted;
    await localAudioTrackRef.current.setEnabled(!nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(async () => {
    if (!localVideoTrackRef.current) return;
    const nextEnabled = !isVideoEnabled;
    await localVideoTrackRef.current.setEnabled(nextEnabled);
    setIsVideoEnabled(nextEnabled);
  }, [isVideoEnabled]);

  useEffect(() => {
    setAuthState(resolveAuthState());
  }, [location.pathname]);

  useEffect(() => {
    if (!authState.token) return undefined;

    const socket = getSocket(authState.token);
    socketRef.current = socket;

    const handleIncomingCall = (payload) => {
      if (activeCall) return;

      setIncomingCall({
        contextType: payload.contextType,
        contextId: payload.contextId,
        mode: payload.mode,
        channelName: payload.channelName,
        from: payload.from || { name: 'Unknown', role: 'user' },
      });
      startRingtone();
    };

    const handleCallEnded = async (payload) => {
      const isActiveMatch =
        activeCall &&
        String(activeCall.contextType) === String(payload.contextType) &&
        String(activeCall.contextId) === String(payload.contextId);

      const isIncomingMatch =
        incomingCall &&
        String(incomingCall.contextType) === String(payload.contextType) &&
        String(incomingCall.contextId) === String(payload.contextId);

      if (!isActiveMatch && !isIncomingMatch) return;

      stopRingtone();
      await clearAgoraSession();
      setActiveCall(null);
      setIncomingCall(null);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-ended', handleCallEnded);
    };
  }, [authState.token, activeCall, incomingCall, clearAgoraSession, startRingtone, stopRingtone]);

  useEffect(() => {
    if (!activeCall || activeCall.mode !== 'video') return;

    if (localVideoTrackRef.current && localVideoContainerRef.current) {
      localVideoTrackRef.current.play(localVideoContainerRef.current);
    }

    remoteUsers.forEach((remoteUser) => {
      const container = remoteVideoRefs.current[String(remoteUser.uid)];
      if (container && remoteUser.videoTrack) {
        remoteUser.videoTrack.play(container);
      }
    });
  }, [activeCall, remoteUsers]);

  useEffect(() => {
    return () => {
      stopRingtone();
      clearAgoraSession();
    };
  }, [stopRingtone, clearAgoraSession]);

  const contextValue = useMemo(
    () => ({
      activeCall,
      incomingCall,
      callError,
      startBookingAudioCall,
      startKycVideoCall,
      endCurrentCall,
      isCallBusy,
    }),
    [activeCall, incomingCall, callError, startBookingAudioCall, startKycVideoCall, endCurrentCall, isCallBusy]
  );

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      {incomingCall && (
        <div className="call-overlay-backdrop">
          <div className="call-modal incoming">
            <div className="call-modal-topline">
              <span className="call-pill incoming-pill">Incoming call</span>
              <span className="call-pill mode-pill">{incomingCall.mode === 'video' ? 'Video KYC' : 'Audio support'}</span>
            </div>

            <h3>{incomingCall.from?.name || 'Unknown'} is calling you</h3>
            <p>
              {incomingCall.from?.role || 'user'} via {incomingCall.contextType === 'kyc' ? 'verification' : 'booking'} channel.
            </p>

            <div className="call-participant-card">
              <div className="call-avatar">{String((incomingCall.from?.name || 'U').slice(0, 1)).toUpperCase()}</div>
              <div>
                <strong>{incomingCall.from?.name || 'Unknown'}</strong>
                <span>{incomingCall.from?.role || 'user'}</span>
              </div>
            </div>

            <div className="call-modal-actions">
              <button type="button" className="call-accept" onClick={acceptIncomingCall}>
                Accept
              </button>
              <button type="button" className="call-decline" onClick={declineIncomingCall}>
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <div className="call-overlay-panel">
          <div className="call-panel-header">
            <div className="call-panel-title-group">
              <span className="call-pill live-pill">Live</span>
              <strong>{activeCall.mode === 'video' ? 'Video call in progress' : 'Audio call in progress'}</strong>
              <p>{activeCall.contextType === 'kyc' ? 'Verification session' : 'Booking support session'}</p>
            </div>
            <button type="button" className="call-end" onClick={() => endCurrentCall('hangup')}>
              End Call
            </button>
          </div>

          <div className="call-meta-row">
            <div className="call-meta-card">
              <span>Channel</span>
              <strong>{activeCall.channelName}</strong>
            </div>
            <div className="call-meta-card">
              <span>Mode</span>
              <strong>{activeCall.mode === 'video' ? 'Video' : 'Audio'}</strong>
            </div>
          </div>

          {activeCall.mode === 'video' ? (
            <div className="call-video-grid">
              <div className="call-video-card primary">
                <span>You</span>
                <div className="video-surface" ref={localVideoContainerRef} />
              </div>

              {remoteUsers.length === 0 ? (
                <div className="call-video-card waiting">
                  <span>Other participant</span>
                  <p>Waiting for the other participant...</p>
                </div>
              ) : (
                remoteUsers.map((remoteUser) => (
                  <div className="call-video-card" key={String(remoteUser.uid)}>
                    <span>Other participant</span>
                    <div
                      className="video-surface"
                      ref={(el) => {
                        remoteVideoRefs.current[String(remoteUser.uid)] = el;
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="call-audio-info">
              <p>Audio call connected. Keep this panel open while you talk.</p>
            </div>
          )}

          <div className="call-controls">
            <button type="button" onClick={toggleMute}>
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>
            {activeCall.mode === 'video' && (
              <button type="button" onClick={toggleVideo}>
                {isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              </button>
            )}
          </div>

          {callError && <p className="call-error">{callError}</p>}
        </div>
      )}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);
