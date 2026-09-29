import { supabase, isSupabaseReady } from './supabaseClient';

export interface Reward {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export const ALL_REWARDS: Reward[] = [
  { id: 'star_first', icon: '⭐', name: 'Estrella', description: 'Completaste una actividad.' },
  { id: 'rainbow', icon: '🌈', name: 'Arcoíris', description: 'Completaste varias actividades.' },
  { id: 'flower', icon: '🌻', name: 'Flor', description: 'Aprendiste una palabra nueva.' },
  { id: 'butterfly', icon: '🦋', name: 'Mariposa', description: 'Aprendiste una letra nueva.' },
  { id: 'sparkle', icon: '🌟', name: 'Estrella Brillante', description: 'Regresaste otro día a aprender.' },
  { id: 'heart', icon: '💜', name: 'Corazón', description: 'Pediste ayuda a Gumi.' },
];

const GUEST_REWARDS_KEY = 'magic_rewards';

function loadGuestRewards(): string[] {
  const raw = localStorage.getItem(GUEST_REWARDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveGuestRewards(rewards: string[]) {
  localStorage.setItem(GUEST_REWARDS_KEY, JSON.stringify(rewards));
}

export async function getEarnedRewardIds(userId: string): Promise<string[]> {
  if (userId !== 'guest' && isSupabaseReady()) {
    const { data, error } = await supabase!
      .from('user_rewards')
      .select('reward_id')
      .eq('user_id', userId);
    if (error) {
      console.warn('Reward load failed:', error);
      return [];
    }
    return (data || []).map((r: any) => r.reward_id as string);
  }
  return loadGuestRewards();
}

export async function earnReward(userId: string, rewardId: string): Promise<boolean> {
  if (userId !== 'guest' && isSupabaseReady()) {
    const { error } = await supabase!
      .from('user_rewards')
      .insert({ user_id: userId, reward_id: rewardId });
    if (error) {
      if (error.code === '23505') return false;
      console.warn('Reward insert failed:', error);
      return false;
    }
    return true;
  }
  const current = loadGuestRewards();
  if (current.includes(rewardId)) return false;
  current.push(rewardId);
  saveGuestRewards(current);
  return true;
}

export function getRewardById(id: string): Reward | undefined {
  return ALL_REWARDS.find(r => r.id === id);
}
