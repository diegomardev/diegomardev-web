import { createClient } from '@supabase/supabase-js';
import TOKENS from '../../../../data/constants';


const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para crear la sala de chat (puedes personalizar según tus necesidades)
export const createChat = async () => {
  const { data, error } = await supabase.from('chats').upsert([{ id: 1, name: 'Chat General' }], { onConflict: ['id'] });

  if (error) {
    console.error('Error al crear la sala de chat:', error);
  } else {
    console.log('Sala de chat creada correctamente:', data);
  }
};

// Función para enviar un mensaje
export const sendMessage = async (text) => {
  const { data, error } = await supabase.from('messages').upsert([{ text, sender: 'Usuario' }]);

  if (error) {
    console.error('Error al enviar el mensaje:', error);
  } else {
    console.log('Mensaje enviado correctamente:', data);
  }
};