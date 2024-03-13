import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Chat.css';
import Navbar from '../../../components/Navbar/Navbar';
import TOKENS from '../../../../data/constants';
import { isMobile } from "react-device-detect";

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
  const [showChatList, setShowChatList] = useState(true);

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
    if (!isMobile) {
      // Si no es un dispositivo móvil, simplemente selecciona el chat
      const { data } = await supabase
        .from('Messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      setMessages(data);
      setSelectedChat(chatId);
    } else {
      // Si es un dispositivo móvil, cambia la visibilidad de la lista de chats
      setShowChatList(false);
      const { data } = await supabase
        .from('Messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      setMessages(data);
      setSelectedChat(chatId);
    }
  };

  const handleBackToChats = () => {
    // Vuelve atrás mostrando la lista de chats
    setShowChatList(true);
    setSelectedChat(null);
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
    const hours = messageTime.getHours();
    const minutes = messageTime.getMinutes();
  
    // Añade un cero a los minutos si son menores que 10
    let formattedMinutes = minutes;
    if(minutes < 10) {
      formattedMinutes = `0${minutes}`;
    }
  
    return `${hours}:${formattedMinutes}`;
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
      {userLogged ? (
        isMobile ? (
          <div className="chat-container">
            {showChatList ? (
              // Mostrar la lista de chats
              <aside className="chat-list" style={{ flex: '100%' }}>
                <div className='chats-navbar'>
                  <h2>Chats Mobile</h2>
                  <button className="new-chat" onClick={handleNewChatFormToggle}>
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
                      <button className="button_normal" type="submit">Create Chat</button>
                    </form>
                  )}
                  {chats.map((chat) => (
                    <li key={chat.id} onClick={() => handleChatSelect(chat.id)}>
                      {chat.name}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : (
              // Mostrar el chat seleccionado y el botón de retroceso
              <div className="selected-chat-mobile">
                <div className='nav-bar-chat'>
                  <button className="back-button" onClick={handleBackToChats}>
                    {'<'}
                  </button>
                  <h3>{chats.find((chat) => chat.id === selectedChat)?.name}</h3>
                  <div style={{ height: '30px', width: '40px' }}>
                    
                  </div>
                </div>
                <div>
                  <div className="chat-messages">
                    <ul>
                      {messages.map((message) => (
                        <li
                          key={message.message_id}
                          className={message.user === userLogged ? 'own-message' : 'other-message'}
                        >
                          {message.user !== userLogged && (
                            <div 
                              className="user-circle"
                              data-username={message.user}
                            >
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
                    <button onClick={handleSendMessage}>Send</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Código para dispositivos no móviles
          <div className="chat-container">
            <aside className="chat-list">
              <div className='chats-navbar'>
                <h2>Chats</h2>
                <button className="new-chat" onClick={handleNewChatFormToggle}>
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
                    <button className="button_normal" type="submit">Create Chat</button>
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
                <h3>{chats.find((chat) => chat.id === selectedChat)?.name}</h3>
                <div className="chat-messages">
                  <ul>
                    {messages.map((message) => (
                      <li
                        key={message.message_id}
                        className={message.user === userLogged ? 'own-message' : 'other-message'}
                      >
                        {message.user !== userLogged && (
                          <div 
                          className="user-circle"
                          data-username={message.user}
                          >
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
                <div>
                  {selectedChat ? (
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
                <button onClick={handleSendMessage}>Send</button>
              </div>
                    ) : (
                    <div className="new-message" style={{justifyContent: 'center'}}>
                      <p>Por favor, seleccione un chat.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        // Si el usuario no está logueado
        <>
          <p>Por favor, inicie sesión para ver los chats.</p>
          <button className="button_normal" onClick={() => { window.location.href = "/login"; }}>Iniciar Sesión</button>
        </>
      )}
    </>
  );
};

export default Chat;
