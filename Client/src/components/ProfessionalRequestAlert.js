import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../api/socket';
import API_BASE_URL from '../config/apiConfig';
import './ProfessionalRequestAlert.css';

const isProfessionalUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.userType === 'professional';
  } catch (error) {
    return false;
  }
};

const createLongMelodyPlayer = () => {
  let audioContext = null;
  let isStopped = true;
  let noteTimer = null;
  let activeNodes = [];

  const sequence = [
    { freq: 523.25, duration: 0.22 },
    { freq: 659.25, duration: 0.2 },
    { freq: 783.99, duration: 0.24 },
    { freq: 659.25, duration: 0.22 },
    { freq: 587.33, duration: 0.2 },
    { freq: 698.46, duration: 0.25 },
    { freq: 783.99, duration: 0.26 },
    { freq: 698.46, duration: 0.28 },
  ];

  const stopNodes = () => {
    activeNodes.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch (error) {
        // no-op
      }
      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch (error) {
        // no-op
      }
    });
    activeNodes = [];
  };

  const playStep = (index = 0) => {
    if (isStopped || !audioContext) return;

    const note = sequence[index % sequence.length];
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(note.freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + note.duration + 0.04);

    activeNodes.push({ oscillator, gain });

    const waitMs = Math.max(120, Math.round(note.duration * 1000 + 90));
    noteTimer = setTimeout(() => playStep(index + 1), waitMs);
  };

  return {
    async start() {
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (!isStopped) return;
      isStopped = false;
      playStep(0);
    },
    stop() {
      isStopped = true;
      if (noteTimer) {
        clearTimeout(noteTimer);
        noteTimer = null;
      }
      stopNodes();
    },
  };
};

function ProfessionalRequestAlert() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const melodyRef = useRef(null);
  const token = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
  const professionalMode = isProfessionalUser();

  useEffect(() => {
    melodyRef.current = createLongMelodyPlayer();
    return () => {
      if (melodyRef.current) {
        melodyRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!professionalMode || soundEnabled || !melodyRef.current) return undefined;

    const unlockAudio = async () => {
      try {
        await melodyRef.current.start();
        melodyRef.current.stop();
        setSoundEnabled(true);
      } catch (error) {
        // Keep waiting for next interaction.
      }
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [professionalMode, soundEnabled]);

  useEffect(() => {
    if (!professionalMode || !token) return undefined;

    let mounted = true;

    const fetchPendingJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/professional/my-jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) return;
        const data = await response.json();
        const pendingBookings = Array.isArray(data?.bookings)
          ? data.bookings.filter((job) => job?.status === 'pending')
          : [];

        if (!mounted) return;

        setPendingJobs(pendingBookings);
        if (pendingBookings.length > 0) {
          setVisible(true);
        }
      } catch (error) {
        // no-op
      }
    };

    fetchPendingJobs();

    const socket = getSocket(token);

    const handleIncomingRequest = () => {
      setVisible(true);
      fetchPendingJobs();
    };

    const handleStatusUpdate = async () => {
      await fetchPendingJobs();
    };

    socket.on('booking-request-created', handleIncomingRequest);
    socket.on('booking-status-changed', handleStatusUpdate);

    return () => {
      mounted = false;
      socket.off('booking-request-created', handleIncomingRequest);
      socket.off('booking-status-changed', handleStatusUpdate);
    };
  }, [professionalMode, token]);

  useEffect(() => {
    if (!professionalMode || !melodyRef.current) return;

    if (visible && pendingJobs.length > 0 && soundEnabled) {
      melodyRef.current.start().catch(() => {
        // no-op
      });
    } else {
      melodyRef.current.stop();
    }
  }, [pendingJobs.length, professionalMode, soundEnabled, visible]);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setActionLoadingId(bookingId);
      const response = await fetch(`${API_BASE_URL}/bookings/professional/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        return;
      }

      setPendingJobs((prev) => prev.filter((job) => String(job._id) !== String(bookingId)));
      if (pendingJobs.length <= 1) {
        setVisible(false);
        melodyRef.current?.stop();
      }
    } catch (error) {
      // no-op
    } finally {
      setActionLoadingId('');
    }
  };

  if (!professionalMode || !visible || pendingJobs.length <= 0) {
    return null;
  }

  const firstPending = pendingJobs[0];

  return (
    <div className="professional-global-alert" role="alert" aria-live="assertive">
      <div className="professional-global-alert__flash" />
      <div className="professional-global-alert__content">
        <strong>New booking request pending</strong>
        <span>{pendingJobs.length} request(s) waiting for your action</span>
        {firstPending ? (
          <span className="professional-global-alert__meta">
            {firstPending?.customerId?.name || 'Customer'} requested {firstPending?.serviceId?.name || 'Service'}
          </span>
        ) : null}
        {!soundEnabled ? (
          <button
            type="button"
            className="professional-global-alert__sound-btn"
            onClick={async () => {
              try {
                await melodyRef.current?.start();
                melodyRef.current?.stop();
                setSoundEnabled(true);
              } catch (error) {
                // no-op
              }
            }}
          >
            Enable alert sound
          </button>
        ) : null}
        {firstPending ? (
          <div className="professional-global-alert__actions">
            <button
              type="button"
              className="approve"
              disabled={actionLoadingId === firstPending._id}
              onClick={() => updateBookingStatus(firstPending._id, 'confirmed')}
            >
              Approve
            </button>
            <button
              type="button"
              className="reject"
              disabled={actionLoadingId === firstPending._id}
              onClick={() => updateBookingStatus(firstPending._id, 'rejected')}
            >
              Reject
            </button>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          if (melodyRef.current) {
            melodyRef.current.stop();
          }
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

export default ProfessionalRequestAlert;
