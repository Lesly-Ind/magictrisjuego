import { supabase, isSupabaseReady } from './supabaseClient';

export interface SessionRecord {
  id: string;
  userId: string;
  sessionStart: number;
  sessionEnd: number | null;
  durationSeconds: number | null;
  activitiesCompleted: number;
}

const GUEST_SESSION_KEY = 'magic_current_session';
const GUEST_SESSIONS_KEY = 'magic_past_sessions';

function loadGuestSession(): SessionRecord | null {
  const raw = localStorage.getItem(GUEST_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveGuestSession(session: SessionRecord) {
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

export function startSession(userId: string): SessionRecord {
  const session: SessionRecord = {
    id: crypto.randomUUID(),
    userId,
    sessionStart: Date.now(),
    sessionEnd: null,
    durationSeconds: null,
    activitiesCompleted: 0,
  };

  if (userId !== 'guest' && isSupabaseReady()) {
    supabase!
      .from('learning_sessions')
      .insert({
        id: session.id,
        user_id: userId,
        session_start: new Date(session.sessionStart).toISOString(),
        activities_completed: 0,
      })
      .then(({ error }) => {
        if (error) console.warn('Session insert failed:', error);
      });
  } else {
    saveGuestSession(session);
  }

  return session;
}

export function incrementActivities(session: SessionRecord): SessionRecord {
  const updated = { ...session, activitiesCompleted: session.activitiesCompleted + 1 };
  if (session.userId !== 'guest' && isSupabaseReady()) {
    supabase!
      .from('learning_sessions')
      .update({ activities_completed: updated.activitiesCompleted })
      .eq('id', session.id)
      .then(({ error }) => {
        if (error) console.warn('Session update failed:', error);
      });
  } else {
    saveGuestSession(updated);
  }
  return updated;
}

export function endSession(session: SessionRecord): SessionRecord {
  const now = Date.now();
  const updated: SessionRecord = {
    ...session,
    sessionEnd: now,
    durationSeconds: Math.floor((now - session.sessionStart) / 1000),
  };

  if (session.userId !== 'guest' && isSupabaseReady()) {
    supabase!
      .from('learning_sessions')
      .update({
        session_end: new Date(now).toISOString(),
        duration_seconds: updated.durationSeconds,
      })
      .eq('id', session.id)
      .then(({ error }) => {
        if (error) console.warn('Session end update failed:', error);
      });
  } else {
    const past = loadGuestPastSessions();
    past.push(updated);
    localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(past));
    localStorage.removeItem(GUEST_SESSION_KEY);
  }

  return updated;
}

function loadGuestPastSessions(): SessionRecord[] {
  const raw = localStorage.getItem(GUEST_SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getSessionDurationSeconds(session: SessionRecord | null): number {
  if (!session) return 0;
  return Math.floor((Date.now() - session.sessionStart) / 1000);
}
