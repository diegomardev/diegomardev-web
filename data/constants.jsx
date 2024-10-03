const TWITCH ={
  CLIENTID:     import.meta.env.VITE_REACT_APP_CLIENTID_TWITCH,
  CLIENTSECRET: import.meta.env.VITE_REACT_APP_CLIENTSECRET_TWITCH,
  ACCESS_TOKEN: import.meta.env.VITE_REACT_APP_ACCESS_TOKEN_TWITCH
}
const SUPABASE ={
  URL: import.meta.env.VITE_REACT_APP_URL_SUPABASE,
  KEY: import.meta.env.VITE_REACT_APP_KEY_SUPABASE
}
const WEATHER ={
  KEY: import.meta.env.API_KEY_WEATHER
}
const TOKENS = {
    TWITCH,
    SUPABASE,
    WEATHER
}
export default TOKENS;