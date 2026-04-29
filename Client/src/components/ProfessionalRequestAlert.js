import React, { useCallback, useEffect, useRef, useState } from 'react';
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

function ProfessionalRequestAlert() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const ringtoneIntervalRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const pendingBeepRef = useRef(false);
  const token = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
  const professionalMode = isProfessionalUser();

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
      // Ignore browser audio restrictions.
    }
  }, []);

  const startRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) return;

    playBeep();
    ringtoneIntervalRef.current = window.setInterval(() => {
      playBeep();
    }, 1300);
  }, [playBeep]);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      window.clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
  }, []);

  const unlockAlertAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;

    audioUnlockedRef.current = true;
    playBeep();

    if (pendingBeepRef.current) {
      pendingBeepRef.current = false;
      window.setTimeout(() => {
        playBeep();
      }, 120);
    }
  }, [playBeep]);

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
        setVisible(pendingBookings.length > 0);
      } catch (error) {
        // no-op
      }
    };

    fetchPendingJobs();

    const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
    unlockEvents.forEach((eventName) => {
      window.addEventListener(eventName, unlockAlertAudio, { once: true });
    });

    const socket = getSocket(token);

    const handleIncomingRequest = () => {
      setVisible(true);
      startRingtone();
      fetchPendingJobs();
    };

    const handleStatusUpdate = async () => {
      await fetchPendingJobs();
    };

    socket.on('booking-request-created', handleIncomingRequest);
    socket.on('booking-status-changed', handleStatusUpdate);

    return () => {
      mounted = false;
      stopRingtone();
      unlockEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlockAlertAudio);
      });
      socket.off('booking-request-created', handleIncomingRequest);
      socket.off('booking-status-changed', handleStatusUpdate);
    };
  }, [professionalMode, token, startRingtone, stopRingtone, unlockAlertAudio]);

  useEffect(() => {
    if (visible && pendingJobs.length > 0) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => stopRingtone();
  }, [pendingJobs.length, startRingtone, stopRingtone, visible]);

  useEffect(() => {
    if (audioUnlockedRef.current || !visible || pendingJobs.length <= 0) return;
    pendingBeepRef.current = true;
  }, [pendingJobs.length, visible]);


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

      setPendingJobs((prev) => {
        const next = prev.filter((job) => String(job._id) !== String(bookingId));
        if (next.length === 0) {
          setVisible(false);
          stopRingtone();
        }
        return next;
      });
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
          stopRingtone();
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

export default ProfessionalRequestAlert;
