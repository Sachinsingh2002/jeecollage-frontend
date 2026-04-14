import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallback = () => {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const { googleSession } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    processCallback();
  }, []);

  const processCallback = async () => {
    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate('/login');
      return;
    }
    const sessionId = match[1];
    const result = await googleSession(sessionId);
    if (result.success) {
      if (result.needs_phone) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#002FA7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-zinc-500">Signing you in...</p>
      </div>
    </div>
  );
};
