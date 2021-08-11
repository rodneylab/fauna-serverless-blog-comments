export const isBrowser = typeof window !== 'undefined';
export const isProduction = process.env.NODE_ENV === 'production';

export function getSessionStorageOrDefault(key, defaultValue) {
  const stored = sessionStorage.getItem(key);
  if (!stored) {
    return defaultValue;
  }
  return JSON.parse(stored);
}
