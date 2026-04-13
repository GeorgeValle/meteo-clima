import { describe, expect, it, vi } from 'vitest';
import { LAST_CITY_STORAGE_KEY, readLastCity, type KeyValueStorage, writeLastCity } from './last-city.storage';

describe('last city storage', () => {
  it('stores trimmed city names under the fixed key', () => {
    const setItem = vi.fn();
    const storage: KeyValueStorage = { getItem: vi.fn(), setItem };

    writeLastCity('  Madrid  ', storage);

    expect(setItem).toHaveBeenCalledWith(LAST_CITY_STORAGE_KEY, 'Madrid');
  });

  it('returns null for empty or missing storage values', () => {
    expect(readLastCity(undefined)).toBeNull();

    const storage: KeyValueStorage = {
      getItem: vi.fn().mockReturnValue('   '),
      setItem: vi.fn(),
    };

    expect(readLastCity(storage)).toBeNull();
  });

  it('swallows storage failures and stays safe', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      setItem: vi.fn(() => {
        throw new Error('blocked');
      }),
    } as unknown as KeyValueStorage;

    expect(() => writeLastCity('Paris', storage)).not.toThrow();
    expect(readLastCity(storage)).toBeNull();
  });
});
