import { useEffect, useState } from 'react';
import { getSessionUser, validateSiteSession } from './pixelArtSession';
import { SESSION_CHANGED, SESSION_KEY, USER_KEY } from './sessionStore';

export function useSessionUser() {
  const [username, setUsername] = useState(getSessionUser);
  useEffect(() => {
    const sync = () => setUsername(getSessionUser());
    const validate = () => { sync(); validateSiteSession().catch(() => {}); };
    const storageChanged = event => { if (event.key === null || event.key === SESSION_KEY || event.key === USER_KEY) validate(); };
    const visibility = () => { if (document.visibilityState === 'visible') validate(); };
    window.addEventListener(SESSION_CHANGED, sync);
    window.addEventListener('storage', storageChanged);
    window.addEventListener('focus', validate);
    document.addEventListener('visibilitychange', visibility);
    const timer = setInterval(validate, 60000);
    validate();
    return () => {
      clearInterval(timer);
      window.removeEventListener(SESSION_CHANGED, sync);
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('focus', validate);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return username;
}
