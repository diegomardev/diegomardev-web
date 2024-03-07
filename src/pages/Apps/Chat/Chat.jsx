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
  const [showEmoticons, setShowEmoticons] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatData, setNewChatData] = useState({
    name: '',
    description: '',
    users: '',
  });

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await supabase
        .from('Chats')
        .select('*')
        .order('created_at', { ascending: false });

      const filteredChats = data.filter(chat => {
        if (chat.users.includes('all')) {
          return true;
        } else if (chat.users.includes(userLogged)) {
          return true;
        }
        return false;
      });

      if (userLogged) {
        setChats(filteredChats);
      }
    };

    fetchChats();
  }, [userLogged]);

  useEffect(() => {
    const subscription = supabase
      .channel(`Messages:chat_id=eq.${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => {
          if (payload.new.chat_id === selectedChat) {
            setMessages((prevMessages) => [...prevMessages, payload.new])
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedChat]);

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
      return;
    }

    await supabase
      .from('Messages')
      .insert([
        {
          chat_id: selectedChat,
          text: newMessage,
          created_at: new Date().toISOString(),
          user: userLogged || "invitado",
        },
      ]);

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (createdAt) => {
    const messageTime = new Date(createdAt);
    return `${messageTime.getHours()}:${messageTime.getMinutes()}`;
  };

  const emoticons = ['😊', '😂', '❤️', '👍', '🎉', '😎', '😍', '🤔'];

  const handleEmoticonClick = (emoticon) => {
    setNewMessage((prevMessage) => prevMessage + emoticon);
  };

  const handleNewChatFormToggle = () => {
    setShowNewChatForm(!showNewChatForm);
  };

  const handleNewChatInputChange = (e) => {
    const { name, value } = e.target;
    setNewChatData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNewChatSubmit = async (e) => {
    e.preventDefault();
    
    // Crear un nuevo chat en Supabase con los datos del formulario
    await supabase
      .from('Chats')
      .insert([
        {
          name: newChatData.name,
          description: newChatData.description,
          users: newChatData.users,
          created_at: new Date().toISOString(),
        },
      ]);

    // Actualizar la lista de chats
    const { data } = await supabase
      .from('Chats')
      .select('*')
      .order('created_at', { ascending: false });

    const filteredChats = data.filter(chat => {
      if (chat.users.includes('all')) {
        return true;
      } else if (chat.users.includes(userLogged)) {
        return true;
      }
      return false;
    });

    setChats(filteredChats);

    // Ocultar el formulario después de crear el chat
    setShowNewChatForm(false);
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="chat-container">
        <aside className="chat-list">
          <div className='chats-navbar'>
            <h2>Chats</h2>
            <button
              className="new-chat"
              onClick={handleNewChatFormToggle}
            >
              +
            </button>
          </div>
          <ul>
          {showNewChatForm && (
            <form onSubmit={handleNewChatSubmit}>
              <input
                className="input"
                type="text"
                placeholder="Chat Name"
                name="name"
                value={newChatData.name}
                onChange={handleNewChatInputChange}
              />
              <input
                style={{ marginTop: '5px' }}
                className="input"
                type="text"
                placeholder="Chat Description"
                name="description"
                value={newChatData.description}
                onChange={handleNewChatInputChange}
              />
              <input
                style={{ marginTop: '5px' }}
                className="input"
                type="text"
                placeholder="Chats Users [name1,name2,name3]"
                name="users"
                value={newChatData.users}
                onChange={handleNewChatInputChange}
              />
              <button className="button_normal" type="submit">Crear Chat</button>
            </form>
          )}
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
                        <div className="message-content">
                          <span className="message-text">{message.text}</span>
                          <span className="message-time">{formatMessageTime(message.created_at)}</span>
                        </div>
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

                  <button style={{ marginTop: '1px', marginRight: '12px', marginLeft: '-45px', height: '30px', width: '30px', padding: '0px', borderRadius: '15px', backgroundColor: 'rgb(59 59 59)' }} onClick={() => setShowEmoticons(!showEmoticons)}>😊</button>
                  {showEmoticons && (
                    <div style={{ marginRight: '10px', minWidth: '180px' }} className="emoticon-container">
                      {emoticons.map((emoticon, index) => (
                        <span
                          key={index}
                          onClick={() => handleEmoticonClick(emoticon)}
                          className="emoticon"
                          style={{ marginRight: '2px' }}
                        >
                          {emoticon}
                        </span>
                      ))}
                    </div>
                  )}
                  <button onClick={handleSendMessage}>Enviar</button>
                </div>
              </div>
            ) : (
              <div style={{ height: '80vh' }}>
                {userLogged ? (
                  <p>Seleccione un chat</p>
                ) : (
                  <>
                    <p>Por favor, inicie sesión para ver los chats.</p>
                    <button className="button_normal" onClick={() => { window.location.href = "/login"; }}>Iniciar Sesión</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
