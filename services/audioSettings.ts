import { AudioSettings, VoiceSpeed, EffectsVolume, DEFAULT_AUDIO_SETTINGS } from '../types';
import { supabase, isSupabaseReady } from './supabaseClient';

const STORAGE_KEY = 'magic_audio_settings';
const GUEST_STORAGE_KEY = 'magic_audio_settings_guest';

let currentSettings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
let listeners: ((s: AudioSettings) => void)[] = [];
let initialized = false;

function notifyListeners() {
  for (const cb of listeners) cb(currentSettings);
}

export function getAudioSettings(): AudioSettings {
  return { ...currentSettings };
}

export function subscribeToAudioSettings(cb: (s: AudioSettings) => void): () => void {
  listeners.push(cb);
  cb(currentSettings);
  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
}

function loadFromLocalStorage(userId: string): AudioSettings {
  try {
    const key = userId === 'guest' ? GUEST_STORAGE_KEY : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_AUDIO_SETTINGS };
}

export async function loadAudioSettings(userId: string): Promise<AudioSettings> {
  if (!userId || userId === 'guest' || !isSupabaseReady()) {
    currentSettings = loadFromLocalStorage(userId || 'guest');
    notifyListeners();
    initialized = true;
    return currentSettings;
  }

  try {
    const { data, error } = await supabase!
      .from('audio_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      currentSettings = { ...DEFAULT_AUDIO_SETTINGS };
    } else {
      currentSettings = {
        voiceVolume: data.voice_volume,
        voiceSpeed: data.voice_speed as VoiceSpeed,
        effectsVolume: data.effects_volume as EffectsVolume,
      };
    }
  } catch {
    currentSettings = { ...DEFAULT_AUDIO_SETTINGS };
  }

  notifyListeners();
  initialized = true;
  return currentSettings;
}

export async function saveAudioSettings(userId: string, settings: AudioSettings): Promise<void> {
  currentSettings = { ...settings };
  notifyListeners();

  if (!userId || userId === 'guest' || !isSupabaseReady()) {
    try {
      const key = userId === 'guest' ? GUEST_STORAGE_KEY : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      // ignore
    }
    return;
  }

  try {
    await supabase!
      .from('audio_preferences')
      .upsert({
        user_id: userId,
        voice_volume: settings.voiceVolume,
        voice_speed: settings.voiceSpeed,
        effects_volume: settings.effectsVolume,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('saveAudioSettings error:', err);
  }
}

export function isAudioSettingsInitialized(): boolean {
  return initialized;
}
