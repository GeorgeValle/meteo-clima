export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const LAST_CITY_STORAGE_KEY = 'meteo-clima:last-city';

function getBrowserStorage(): KeyValueStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function readLastCity(storage: KeyValueStorage | undefined = getBrowserStorage()): string | null {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(LAST_CITY_STORAGE_KEY)?.trim();
    return value ? value : null;
  } catch {
    return null;
  }
}

export function writeLastCity(
  city: string,
  storage: KeyValueStorage | undefined = getBrowserStorage(),
): void {
  const trimmedCity = city.trim();

  if (!trimmedCity || !storage) {
    return;
  }

  try {
    storage.setItem(LAST_CITY_STORAGE_KEY, trimmedCity);
  } catch {
    // Ignore storage failures so the app stays usable in restricted environments.
  }
}
