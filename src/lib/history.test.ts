import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  HISTORY_STORAGE_KEY,
  appendHistory,
  readHistory,
  readHistoryItem,
} from './history';

const item = (id: string) => ({
  id,
  date: '2026-01-01T00:00:00.000Z',
  transcript: `transcript ${id}`,
  blogPost: `blog ${id}`,
  socialPost: `social ${id}`,
});

// A minimal localStorage stand-in, so the storage helpers can be tested in
// the plain node environment without pulling in a DOM implementation.
function stubStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    },
  });
  return store;
}

describe('history storage', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = stubStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty list when nothing was saved', () => {
    expect(readHistory()).toEqual([]);
  });

  it('returns an empty list when the stored value is not valid json', () => {
    store.set(HISTORY_STORAGE_KEY, '{not json');
    expect(readHistory()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    store.set(HISTORY_STORAGE_KEY, '{"id":"x"}');
    expect(readHistory()).toEqual([]);
  });

  it('drops entries without an id', () => {
    store.set(HISTORY_STORAGE_KEY, JSON.stringify([item('a'), { transcript: 'no id' }]));
    expect(readHistory().map((entry) => entry.id)).toEqual(['a']);
  });

  it('prepends a saved item to the history', () => {
    appendHistory(item('first'));
    appendHistory(item('second'));
    expect(readHistory().map((entry) => entry.id)).toEqual(['second', 'first']);
  });

  it('finds a saved item by its id', () => {
    appendHistory(item('first'));
    appendHistory(item('second'));
    expect(readHistoryItem('first')?.transcript).toBe('transcript first');
    expect(readHistoryItem('missing')).toBeNull();
    expect(readHistoryItem(null)).toBeNull();
  });

  it('keeps working when the stored value is corrupted', () => {
    store.set(HISTORY_STORAGE_KEY, 'not json at all');
    appendHistory(item('after-corruption'));
    expect(readHistory().map((entry) => entry.id)).toEqual(['after-corruption']);
  });
});
