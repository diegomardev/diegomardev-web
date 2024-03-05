import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Chat.css';
import Navbar from '../../../components/Navbar/Navbar';
import TOKENS from '../../../../data/constants';

const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userLogged, setUserLogged] = useState(localStorage.getItem('user_logged'));

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await supabase
        .from('Chats')
        .select('*')
        .order('created_at', { ascending: false });

      setChats(data);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel(`Messages:chat_id=eq.${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => setMessages((prevMessages) => [...prevMessages, payload.new]),
        console.log(messages)
      )
      .subscribe();

    // Limpia la suscripción cuando el componente se desmonta
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  
  const handleChatSelect = async (chatId) => {
    const { data } = await supabase
      .from('Messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    setMessages(data);
    setSelectedChat(chatId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      return; // Evitar mensajes vacíos
    }

    await supabase
      .from('Messages')
      .insert([
        {
          chat_id: selectedChat,
          text: newMessage,
          created_at: new Date().toISOString(),
          user: userLogged,
        },
      ]);

    // No es necesario llamar a handleChatSelect(selectedChat) porque la suscripción se encargará de actualizar los mensajes automáticamente.

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="chat-container">
        <aside className="chat-list">
          <h2>Chats</h2>
          <ul>
            {chats.map((chat) => (
              <li key={chat.id} onClick={() => handleChatSelect(chat.id)}>
                {chat.name}
              </li>
            ))}
          </ul>
        </aside>

        <div className="selected-chat">
          <div>
            {selectedChat ? (
              <div>
                <h3>{chats.find((chat) => chat.id === selectedChat)?.name}</h3>
                <div className="chat-messages">
                  <ul>
                  {messages.map((message) => (
                    <li
                      key={message.message_id}
                      className={message.user === userLogged ? 'own-message' : 'other-message'}
                    >
                      {message.user !== userLogged && (
                        <div className="user-circle">
                          {message.user.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {message.text}
                    </li>
                  ))}
                  </ul>
                </div>
                <div className="new-message">
                  <input
                    type="text"
                    placeholder="Escribe un nuevo mensaje"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button onClick={handleSendMessage}>Enviar</button>
                </div>
              </div>
            ) : (
              <p style={{ height: '60vh' }}>Selecciona un chat</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;