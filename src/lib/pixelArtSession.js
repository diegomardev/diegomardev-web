import { createClient } from '@supabase/supabase-js';
import TOKENS from '../../data/constants';
import { createSessionStore, endSession, SESSION_CHANGED, SESSION_KEY } from './sessionStore';

export const pixelArtSupabase = createClient(TOKENS.SUPABASE.URL, TOKENS.SUPABASE.KEY);
export const PIXEL_ART_SESSION_KEY = SESSION_KEY;
const sessionStore = createSessionStore(localStorage, () => window.dispatchEvent(new Event(SESSION_CHANGED)));
export const getPixelArtToken = sessionStore.getToken;
export const getSessionUser = sessionStore.getUser;
export const setSiteSession = sessionStore.set;
export const clearSiteSession = sessionStore.clear;
export const logoutSiteSession = () => endSession(sessionStore, token => pixelArtSupabase.rpc('pixel_art_logout', { p_token: token }));

const validations = new Map();
export function validateSiteSession() {
  const token = getPixelArtToken();
  if (!token) { clearSiteSession(); return Promise.resolve(null); }
  if (validations.has(token)) return validations.get(token);
  const request = (async () => {
    const { data, error } = await pixelArtSupabase.rpc('pixel_art_session_user', { p_token: token });
    if (getPixelArtToken() !== token) return null;
    if (error) {
      if (error.code === '28000' || error.code === '22P02') clearSiteSession(token);
      throw error;
    }
    if (!data) { clearSiteSession(token); return null; }
    setSiteSession(token, data);
    return data;
  })().finally(() => validations.delete(token));
  validations.set(token, request);
  return request;
}
