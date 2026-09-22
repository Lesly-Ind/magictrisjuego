import { ContentProgress, ContentType, MasteryLevel } from '../types';
import { supabase, isSupabaseReady } from './supabaseClient';

const STORAGE_KEY_PREFIX = 'magic_progress_';

function getLocalProgress(userId: string): Record<string, ContentProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalProgress(userId: string, data: Record<string, ContentProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

function calculateNextReview(consecutiveCorrect: number, masteryLevel: MasteryLevel): string {
  const now = new Date();
  let hours = 4;

  if (masteryLevel >= 3) {
    if (consecutiveCorrect >= 6) hours = 72;
    else if (consecutiveCorrect >= 4) hours = 48;
    else hours = 24;
  } else if (masteryLevel >= 2) {
    if (consecutiveCorrect >= 3) hours = 24;
    else hours = 12;
  } else {
    if (consecutiveCorrect >= 2) hours = 8;
    else hours = 4;
  }

  now.setHours(now.getHours() + hours);
  return now.toISOString();
}

function computeMasteryLevel(progress: ContentProgress): MasteryLevel {
  const { correct_attempts, incorrect_attempts, consecutive_correct } = progress;
  if (consecutive_correct >= 4 && correct_attempts >= 5 && incorrect_attempts === 0) return 3;
  if (consecutive_correct >= 2 && correct_attempts >= 3) return 2;
  if (correct_attempts >= 1) return 1;
  return 0;
}

export function isGuest(userId: string): boolean {
  return userId === 'guest' || !userId;
}

export function getChoiceCount(masteryLevel: MasteryLevel): number {
  if (masteryLevel >= 3) return 4;
  if (masteryLevel >= 2) return 3;
  return 2;
}

export async function fetchAllProgress(userId: string, contentType?: ContentType): Promise<Record<string, ContentProgress>> {
  if (isGuest(userId) || !isSupabaseReady()) {
    const local = getLocalProgress(userId);
    if (!contentType) return local;
    return Object.fromEntries(Object.entries(local).filter(([, p]) => p.content_type === contentType));
  }

  try {
    let query = supabase!.from('content_progress').select('*').eq('user_id', userId);
    if (contentType) query = query.eq('content_type', contentType);
    const { data, error } = await query;
    if (error) {
      console.warn('fetchAllProgress error:', error.message);
      return {};
    }
    const map: Record<string, ContentProgress> = {};
    for (const row of data || []) {
      map[row.content_id] = {
        content_id: row.content_id,
        content_type: row.content_type as ContentType,
        attempts: row.attempts,
        correct_attempts: row.correct_attempts,
        incorrect_attempts: row.incorrect_attempts,
        mastery_level: row.mastery_level as MasteryLevel,
        consecutive_correct: row.consecutive_correct,
        completed: row.completed,
        last_seen_at: row.last_seen_at,
        next_review_at: row.next_review_at,
      };
    }
    return map;
  } catch (err) {
    console.warn('fetchAllProgress exception:', err);
    return {};
  }
}

export async function recordAttempt(
  userId: string,
  contentId: string,
  contentType: ContentType,
  correct: boolean
): Promise<ContentProgress> {
  const allProgress = await fetchAllProgress(userId, contentType);
  const existing = allProgress[contentId];

  const progress: ContentProgress = existing
    ? { ...existing }
    : {
        content_id: contentId,
        content_type: contentType,
        attempts: 0,
        correct_attempts: 0,
        incorrect_attempts: 0,
        mastery_level: 0,
        consecutive_correct: 0,
        completed: false,
        last_seen_at: null,
        next_review_at: new Date().toISOString(),
      };

  progress.attempts += 1;
  if (correct) {
    progress.correct_attempts += 1;
    progress.consecutive_correct += 1;
  } else {
    progress.incorrect_attempts += 1;
    progress.consecutive_correct = 0;
  }
  progress.last_seen_at = new Date().toISOString();
  progress.mastery_level = computeMasteryLevel(progress);
  progress.completed = progress.mastery_level >= 3;
  progress.next_review_at = calculateNextReview(progress.consecutive_correct, progress.mastery_level);

  if (isGuest(userId) || !isSupabaseReady()) {
    const local = getLocalProgress(userId);
    local[contentId] = progress;
    setLocalProgress(userId, local);
    return progress;
  }

  try {
    const { error } = await supabase!
      .from('content_progress')
      .upsert({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        attempts: progress.attempts,
        correct_attempts: progress.correct_attempts,
        incorrect_attempts: progress.incorrect_attempts,
        mastery_level: progress.mastery_level,
        consecutive_correct: progress.consecutive_correct,
        completed: progress.completed,
        last_seen_at: progress.last_seen_at,
        next_review_at: progress.next_review_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,content_id' });

    if (error) console.warn('recordAttempt upsert error:', error.message);
  } catch (err) {
    console.warn('recordAttempt exception:', err);
  }

  return progress;
}

export function getProgressForContent(
  progressMap: Record<string, ContentProgress>,
  contentId: string
): ContentProgress | undefined {
  return progressMap[contentId];
}

export function needsReview(progress: ContentProgress | undefined): boolean {
  if (!progress) return true;
  if (progress.mastery_level >= 3) {
    return new Date(progress.next_review_at) <= new Date();
  }
  return true;
}

export function getReviewQueue(
  progressMap: Record<string, ContentProgress>,
  allContentIds: string[]
): string[] {
  return allContentIds.filter(id => needsReview(progressMap[id]));
}

export function getRecommendedContent(
  progressMap: Record<string, ContentProgress>,
  allContentIds: string[]
): string[] {
  const notStarted = allContentIds.filter(id => !progressMap[id]);
  const dueReview = getReviewQueue(progressMap, allContentIds).filter(
    id => progressMap[id] && progressMap[id].mastery_level < 3
  );
  const masteredReview = getReviewQueue(progressMap, allContentIds).filter(
    id => progressMap[id] && progressMap[id].mastery_level >= 3
  );
  return [...notStarted, ...dueReview, ...masteredReview];
}
