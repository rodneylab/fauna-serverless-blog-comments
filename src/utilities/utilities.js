export const isBrowser = typeof window !== 'undefined';
export const isProduction = process.env.NODE_ENV === 'production';

export function getSessionStorageOrDefault(key, defaultValue) {
  if (isBrowser) {
    const stored = sessionStorage.getItem(key);
    if (!stored) {
      return defaultValue;
    }
    return JSON.parse(stored);
  }
  return defaultValue;
}

export function setSessionStorage(key, value) {
  if (isBrowser) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}
