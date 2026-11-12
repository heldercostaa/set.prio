import { create } from 'zustand';
import { DAYS, type Day, type Language, type Preferences, type Priority } from '../types';

export const STORAGE_KEY = 'set.prio:brasil-2027:v1';
type StorageError = 'unavailable' | 'recovered' | 'protected' | null;
const defaults: Preferences = {
  version: 1,
  language: 'en',
  activeDay: DAYS[0],
  priorities: {},
  ratings: {},
  comments: {},
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function load(): { preferences: Preferences; error: StorageError; writable: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
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
        value === null || (typeof value === 'string' && ['P0', 'P1', 'P2', 'P3'].includes(value))
    );
    const validRatings = Object.values(data.ratings).every(
      (value) =>
        value === null ||
        (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10)
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
        language: data.language === 'pt-BR' ? 'pt-BR' : 'en',
        activeDay: DAYS.includes(data.activeDay as Day) ? (data.activeDay as Day) : DAYS[0],
        priorities,
        ratings,
        comments,
      },
      error: null,
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
  storageError: StorageError;
  setPriority: (id: string, priority: Priority | null) => void;
  setComment: (id: string, comment: string) => void;
  setRating: (id: string, rating: number | null) => void;
  setLanguage: (language: Language) => void;
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
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 10)) return;
    set((state) => ({ ratings: { ...state.ratings, [id]: rating } }));
  },
  setLanguage: (language) => set({ language }),
  setDay: (activeDay) => set({ activeDay }),
}));
function serialize(state: Planner) {
  return JSON.stringify({
    version: 1,
    language: state.language,
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
