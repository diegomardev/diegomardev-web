import { createClient } from '@supabase/supabase-js';
import TOKENS from '../../data/constants';

export const pixelArtSupabase = createClient(TOKENS.SUPABASE.URL, TOKENS.SUPABASE.KEY);
export const PIXEL_ART_SESSION_KEY = 'pixel_art_session';
export const getPixelArtToken = () => localStorage.getItem(PIXEL_ART_SESSION_KEY);
