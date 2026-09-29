import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { SessionRecord, startSession, endSession, incrementActivities, getSessionDurationSeconds } from '../services/sessionService';

export interface SessionState {
  session: SessionRecord | null;
  breakLevel: 5 | 10 | null;
  startSession: () => void;
  endCurrentSession: () => void;
  recordActivity: () => void;
  dismissBreak: () => void;
}

export function useSession(user: User): SessionState {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [breakLevel, setBreakLevel] = useState<5 | 10 | null>(null);
  const fiveMinShown = useRef(false);
  const tenMinShown = useRef(false);

  const checkBreakTime = useCallback(() => {
    if (!session) return;
    const seconds = getSessionDurationSeconds(session);
    if (!fiveMinShown.current && seconds >= 300) {
      fiveMinShown.current = true;
      setBreakLevel(5);
      return;
    }
    if (!tenMinShown.current && seconds >= 600) {
      tenMinShown.current = true;
      setBreakLevel(10);
      return;
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(checkBreakTime, 5000);
    return () => clearInterval(interval);
  }, [session, checkBreakTime]);

  const handleStartSession = useCallback(() => {
    fiveMinShown.current = false;
    tenMinShown.current = false;
    setBreakLevel(null);
    setSession(startSession(user.id));
  }, [user.id]);

  const handleEndSession = useCallback(() => {
    setSession(prev => {
      if (prev) endSession(prev);
      return null;
    });
    setBreakLevel(null);
  }, []);

  const handleRecordActivity = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      return incrementActivities(prev);
    });
  }, []);

  const handleDismissBreak = useCallback(() => {
    setBreakLevel(null);
  }, []);

  return {
    session,
    breakLevel,
    startSession: handleStartSession,
    endCurrentSession: handleEndSession,
    recordActivity: handleRecordActivity,
    dismissBreak: handleDismissBreak,
  };
}
