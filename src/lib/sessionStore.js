export const SESSION_KEY = 'pixel_art_session';
export const USER_KEY = 'user_logged';
export const SESSION_CHANGED = 'site-session-changed';

export function createSessionStore(storage, notify) {
  const getToken = () => storage.getItem(SESSION_KEY);
  const getUser = () => getToken() ? storage.getItem(USER_KEY) : null;
  function set(token, username) {
    if (!token || !username) throw new Error('Incomplete session');
    if (getToken() === token && storage.getItem(USER_KEY) === username) return;
    storage.setItem(SESSION_KEY, token);
    storage.setItem(USER_KEY, username);
    notify();
  }
  function clear(expectedToken) {
    if (expectedToken !== undefined && getToken() !== expectedToken) return false;
    const changed = getToken() !== null || storage.getItem(USER_KEY) !== null;
    storage.removeItem(SESSION_KEY);
    storage.removeItem(USER_KEY);
    if (changed) notify();
    return true;
  }
  return { getToken, getUser, set, clear };
}

// Supabase builders are thenables, not native promises with .catch().
// Always clear locally before waiting for network revocation.
export async function endSession(store, revoke) {
  const token = store.getToken();
  store.clear();
  if (token) {
    try { await revoke(token); } catch { /* Local logout still succeeds offline. */ }
  }
}
