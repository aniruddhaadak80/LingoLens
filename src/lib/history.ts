export interface HistoryItem {
  id: string;
  date: string;
  transcript: string;
  blogPost: string;
  socialPost: string;
  translation?: string;
}

export const HISTORY_STORAGE_KEY = 'lingoLensHistory';

/**
 * Read the saved history from local storage.
 *
 * The stored value is user data that can be truncated or hand edited, so the
 * parse is guarded and anything that is not a usable list is treated as an
 * empty history instead of crashing the page.
 */
export function readHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryItem =>
        !!entry && typeof entry === 'object' && typeof (entry as HistoryItem).id === 'string',
    );
  } catch {
    return [];
  }
}

/** Find one saved item by its id. */
export function readHistoryItem(id: string | null | undefined): HistoryItem | null {
  if (!id) return null;
  return readHistory().find((entry) => entry.id === id) ?? null;
}

/** Prepend an item to the saved history. */
export function appendHistory(item: HistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([item, ...readHistory()]));
  } catch {
    // Storage can be unavailable (private mode, quota). Saving is best effort.
  }
}
