import { isRating } from '../utils/ratings';
import { create } from 'zustand';
import { DAYS, type Day, type Language, type Preferences, type Priority } from '../types';

export const STORAGE_KEY = 'set.priority:brasil-2027:v1';
const LEGACY_STORAGE_KEY = 'set.prio:brasil-2027:v1';
type StorageError = 'unavailable' | 'recovered' | 'protected' | 'migrationConflict' | null;
type DisplayPreferences = { showArtistFlags: boolean; showArtistRatings: boolean };
const defaults: Preferences & DisplayPreferences = {
  version: 1,
  language: 'pt-BR',
  showArtistFlags: true,
  showArtistRatings: true,
  activeDay: DAYS[0],
  priorities: {},
  ratings: {},
  comments: {},
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function load(): {
  preferences: Preferences & DisplayPreferences;
  error: StorageError;
  writable: boolean;
} {
  let raw: string | null;
  let migrationConflict = false;
  try {
    raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (window.location.hostname === 'setprio.vercel.app') {
      const destination = new URL('https://set-priority.vercel.app');
      destination.search = window.location.search;
      if (raw) destination.hash = new URLSearchParams({ 'transfer-plan': raw }).toString();
      window.location.replace(destination);
    }
    const transfer = new URLSearchParams(window.location.hash.slice(1)).get('transfer-plan');
    if (transfer !== null) {
      if (raw !== null && raw !== transfer) {
        localStorage.setItem(`${STORAGE_KEY}:backup:transfer:${Date.now()}`, transfer);
        migrationConflict = true;
      } else {
        raw = transfer;
        localStorage.setItem(STORAGE_KEY, raw);
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (raw !== null && localStorage.getItem(STORAGE_KEY) === null)
      localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    return { preferences: defaults, error: 'unavailable', writable: false };
  }
  if (!raw) return { preferences: defaults, error: null, writable: true };
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !isRecord(data) ||
      data.version !== 1 ||
      !isRecord(data.priorities) ||
      !isRecord(data.ratings) ||
      !isRecord(data.comments)
    )
      throw new Error('Unsupported save');
    const validPriorities = Object.values(data.priorities).every(
      (value) =>
        value === null ||
        (typeof value === 'string' && ['P0', 'P1', 'P2', 'P3', 'P4'].includes(value))
    );
    const validRatings = Object.values(data.ratings).every(
      (value) => value === null || isRating(value)
    );
    const validComments = Object.values(data.comments).every((value) => typeof value === 'string');
    if (!validPriorities || !validRatings || !validComments)
      throw new Error('Malformed preferences');
    const priorities = data.priorities as Preferences['priorities'];
    const ratings = data.ratings as Preferences['ratings'];
    const comments = data.comments as Preferences['comments'];
    return {
      preferences: {
        ...defaults,
        language: data.language === 'en' ? 'en' : 'pt-BR',
        showArtistFlags: typeof data.showArtistFlags === 'boolean' ? data.showArtistFlags : true,
        showArtistRatings:
          typeof data.showArtistRatings === 'boolean' ? data.showArtistRatings : true,
        activeDay: DAYS.includes(data.activeDay as Day) ? (data.activeDay as Day) : DAYS[0],
        priorities,
        ratings,
        comments,
      },
      error: migrationConflict ? 'migrationConflict' : null,
      writable: true,
    };
  } catch {
    try {
      localStorage.setItem(`${STORAGE_KEY}:backup:${Date.now()}`, raw);
      return { preferences: defaults, error: 'recovered', writable: true };
    } catch {
      return { preferences: defaults, error: 'protected', writable: false };
    }
  }
}
interface Planner extends Preferences {
  showArtistFlags: boolean;
  showArtistRatings: boolean;
  storageError: StorageError;
  setPriority: (id: string, priority: Priority | null) => void;
  setComment: (id: string, comment: string) => void;
  setRating: (id: string, rating: number | null) => void;
  setLanguage: (language: Language) => void;
  setShowArtistFlags: (show: boolean) => void;
  setShowArtistRatings: (show: boolean) => void;
  setDay: (day: Day) => void;
}
const initial = load();
export const usePlanner = create<Planner>((set) => ({
  ...initial.preferences,
  storageError: initial.error,
  setPriority: (id, priority) =>
    set((state) => ({ priorities: { ...state.priorities, [id]: priority } })),
  setComment: (id, comment) => set((state) => ({ comments: { ...state.comments, [id]: comment } })),
  setRating: (id, rating) => {
    if (rating !== null && !isRating(rating)) return;
    set((state) => ({ ratings: { ...state.ratings, [id]: rating } }));
  },
  setLanguage: (language) => set({ language }),
  setShowArtistFlags: (showArtistFlags) => set({ showArtistFlags }),
  setShowArtistRatings: (showArtistRatings) => set({ showArtistRatings }),
  setDay: (activeDay) => set({ activeDay }),
}));
function serialize(state: Planner) {
  return JSON.stringify({
    version: 1,
    language: state.language,
    showArtistFlags: state.showArtistFlags,
    showArtistRatings: state.showArtistRatings,
    activeDay: state.activeDay,
    priorities: state.priorities,
    ratings: state.ratings,
    comments: state.comments,
  });
}
usePlanner.subscribe((state, previous) => {
  if (!initial.writable || serialize(state) === serialize(previous)) return;
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
  } catch {
    if (state.storageError !== 'unavailable') usePlanner.setState({ storageError: 'unavailable' });
  }
});

export function resetPlanner(): boolean {
  try {
    const keys = Object.keys(localStorage).filter(
      (key) =>
        key === STORAGE_KEY ||
        key.startsWith(`${STORAGE_KEY}:backup:`) ||
        key === 'set.priority:appearance' ||
        key === LEGACY_STORAGE_KEY ||
        key.startsWith(`${LEGACY_STORAGE_KEY}:backup:`) ||
        key === 'set.prio:appearance'
    );
    for (const key of keys) localStorage.removeItem(key);
    initial.writable = true;
    usePlanner.setState({
      ...defaults,
      priorities: {},
      ratings: {},
      comments: {},
      storageError: null,
    });
    return true;
  } catch {
    return false;
  }
}
