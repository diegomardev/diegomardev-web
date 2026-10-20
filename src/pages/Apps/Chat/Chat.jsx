import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconMessageCircle, IconMoodSmile, IconPlus, IconSend, IconDots, IconArchive, IconTrash, IconRestore, IconInfoCircle, IconUsers, IconCalendar, IconX } from '@tabler/icons-react';
import Navbar from '../../../components/Navbar/Navbar';
import { getPixelArtToken, pixelArtSupabase as supabase } from '../../../lib/pixelArtSession';
import { useChatReceipts } from './useChatReceipts';
import { MessageChecks } from './MessageChecks';
import { canViewChat, formatMessageDate, messageDayKey, formatMessageTime, mergeMessages, messageKey, parseChatUsers } from './chatUtils';
import './Chat.css';

const EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '😎', '😍', '🤔'];
const emptyChat = { name: '', description: '', users: '' };

export default function Chat() {
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const infoClose = useRef(null);
  const infoOrigin = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const composerForm = useRef(null);
  const [username, setUsername] = useState(() => localStorage.getItem('user_logged'));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteDialog = useRef(null);
  const [roomMenuId, setRoomMenuId] = useState(null);
  const roomActionsRef = useRef(null);
  const [roomStates, setRoomStates] = useState({});
  const [listView, setListView] = useState('active');
  const [changingRoom, setChangingRoom] = useState(false);
  const [roomActionError, setRoomActionError] = useState('');
  const roomActionLock = useRef(false);
  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [listError, setListError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [newChat, setNewChat] = useState(emptyChat);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [listRevision, setListRevision] = useState(0);
  const [messageRevision, setMessageRevision] = useState(0);
  const messagePane = useRef(null);
  const composer = useRef(null);
  const emojiPanel = useRef(null);
  const createDialog = useRef(null);
  const shouldFollow = useRef(true);
  const sendLock = useRef(false);
  const createLock = useRef(false);
  const selectedRef = useRef(selectedId);
  const usernameRef = useRef(username);
  selectedRef.current = selectedId;
  usernameRef.current = username;
  const selectedChat = chats.find(room => room.id === selectedId && !roomStates[room.id]);
  const hiddenChats = chats.filter(room => roomStates[room.id] === 'archived');
  const shownChats = chats.filter(room => (roomStates[room.id] || 'active') === listView);
  const draft = drafts[selectedId] || '';
  const { statuses, receiptError, events, groupInfo } = useChatReceipts({ username, selectedId, messages, messagePane });

  const members = groupInfo?.id === selectedId ? groupInfo.members || [] : [];
  const membersLabel = groupInfo?.id === selectedId ? members.join(', ') : 'Cargando participantes…';

  function openGroupInfo(event) {
    infoOrigin.current = event?.currentTarget;
    setRoomMenuId(null);
    setShowGroupInfo(true);
  }

  function closeGroupInfo() {
    setShowGroupInfo(false);
    if (infoOrigin.current?.isConnected) infoOrigin.current.focus();
    else document.querySelector('.dm-chat-header-actions > button')?.focus();
  }

  useEffect(() => { setShowGroupInfo(false); }, [selectedId, username]);
  useEffect(() => {
    if (!showGroupInfo) return;
    infoClose.current?.focus();
    const escape = event => { if (event.key === 'Escape') closeGroupInfo(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [showGroupInfo]);

  const timeline = mergeMessages(messages, events.map(event => ({ message_id: `event:${event.id}`, created_at: event.created_at, systemEvent: true, user: event.username })));

  useEffect(() => {
    if (!composerForm.current) { setFooterHeight(0); return; }
    const observer = new ResizeObserver(entries => setFooterHeight(entries[0].target.getBoundingClientRect().height));
    observer.observe(composerForm.current);
    return () => observer.disconnect();
  }, [selectedChat?.id]);

  useEffect(() => {
    const syncUser = () => setUsername(localStorage.getItem('user_logged'));
    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  useEffect(() => {
    setChats([]);
    setRoomStates({});
    setListView('active');
    setRoomActionError('');
    setSelectedId(null);
    setDrafts({});
    setShowEmoji(false);
  }, [username]);

  useEffect(() => {
    let active = true;
    if (!username) { setLoadingChats(false); return; }
    async function loadChats() {
      setLoadingChats(true);
      setListError('');
      try {
        const [{ data, error }, hidden] = await Promise.all([
          supabase.from('Chats').select('*').order('created_at', { ascending: false }),
          supabase.rpc('chat_list_room_states', { p_token: getPixelArtToken() }),
        ]);
        if (!active) return;
        if (error || hidden.error) throw error || hidden.error;
        setRoomStates(hidden.data || {});
        const visible = (data || []).filter(room => canViewChat(room, username));
        setChats(visible);
        setSelectedId(current => visible.some(room => room.id === current && !(hidden.data || {})[room.id]) ? current : null);
      } catch {
        if (active) setListError('Could not load your chats. If your session expired, sign in again.');
      } finally { if (active) setLoadingChats(false); }
    }
    loadChats();
    return () => { active = false; };
  }, [username, listRevision]);

  useEffect(() => {
    let active = true;
    setMessages([]);
    setMessageError('');
    setSendError('');
    setShowEmoji(false);
    shouldFollow.current = true;
    if (!selectedId || !username) { setLoadingMessages(false); return; }
    setLoadingMessages(true);
    const channel = supabase.channel(`chat-messages-${selectedId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages', filter: `chat_id=eq.${selectedId}` }, payload => {
        if (active && payload.new.chat_id === selectedId) setMessages(current => mergeMessages(current, [payload.new]));
      })
      .subscribe(status => {
        if (!active) return;
        if (status === 'SUBSCRIBED') loadMessages();
      });
    async function loadMessages() {
      try {
        const { data, error } = await supabase.from('Messages').select('*').eq('chat_id', selectedId).order('created_at', { ascending: true });
        if (!active) return;
        if (error) throw error;
        setMessages(current => mergeMessages(data || [], current));
      } catch {
        if (active) setMessageError('Could not load this conversation.');
      } finally { if (active) setLoadingMessages(false); }
    }
    loadMessages();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [selectedId, username, messageRevision]);

  useEffect(() => {
    if (messagePane.current && shouldFollow.current) messagePane.current.scrollTop = messagePane.current.scrollHeight;
  }, [messages, events, loadingMessages]);

  useEffect(() => {
    if (!showEmoji) return;
    const close = event => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'keydown' || !emojiPanel.current?.contains(event.target)) setShowEmoji(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [showEmoji]);

  useEffect(() => {
    if (!roomMenuId) return;
    roomActionsRef.current?.querySelector('[role="menuitem"]')?.focus();
    const dismiss = event => {
      if (event.type === 'keydown') {
        if (event.key !== 'Escape') return;
        roomActionsRef.current?.querySelector('[aria-haspopup="menu"]')?.focus();
      } else if (roomActionsRef.current?.contains(event.target)) return;
      setRoomMenuId(null);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismiss);
    };
  }, [roomMenuId]);

  useEffect(() => { setRoomMenuId(null); }, [username, listView]);

  function updateDraft(value) {
    setDrafts(current => ({ ...current, [selectedId]: value }));
  }

  async function sendMessage(event) {
    event?.preventDefault();
    if (sendLock.current || !draft.trim() || !selectedChat || !username) return;
    const roomId = selectedId;
    const author = username;
    const originalDraft = draft;
    sendLock.current = true;
    setSending(true);
    setSendError('');
    try {
      const { data, error } = await supabase.rpc('chat_send_message', {
        p_token: getPixelArtToken(), p_chat_id: roomId, p_text: originalDraft.trim(),
      });
      if (error || !data) throw error || new Error('Empty response');
      if (usernameRef.current !== author) return;
      setDrafts(current => current[roomId] === originalDraft ? { ...current, [roomId]: '' } : current);
      if (selectedRef.current === roomId) {
        shouldFollow.current = true;
        setMessages(current => mergeMessages(current, [data]));
        composer.current?.focus();
      }
    } catch {
      if (selectedRef.current === roomId && usernameRef.current === author) setSendError('Message not sent. Your text is still here; please try again.');
    } finally { sendLock.current = false; setSending(false); }
  }

  async function changeChatState(room, state) {
    if (roomActionLock.current) return;
    setRoomMenuId(null);
    roomActionLock.current = true;
    setChangingRoom(true);
    setRoomActionError('');
    const author = username;
    try {
      const { error } = await supabase.rpc(state === 'deleted' ? 'chat_delete_forever' : 'chat_set_room_state', {
        p_token: getPixelArtToken(), p_chat_id: room.id, ...(state === 'deleted' ? {} : { p_state: state }),
      });
      if (error) throw error;
      if (usernameRef.current !== author) return;
      setRoomStates(current => { const next = { ...current }; if (state === 'active') delete next[room.id]; else next[room.id] = state; return next; });
      if (state !== 'active') setSelectedId(current => current === room.id ? null : current);
      else { setListView('active'); setSelectedId(room.id); }
      if (state === 'deleted') setDrafts(current => { const next = { ...current }; delete next[room.id]; return next; });
      return true;
    } catch {
      if (usernameRef.current === author) setRoomActionError('Could not update this chat. Please try again.');
      return false;
    } finally { roomActionLock.current = false; setChangingRoom(false); }
  }

  function requestDeleteChat(room) {
    setRoomMenuId(null);
    setRoomActionError('');
    setDeleteTarget(room);
    deleteDialog.current.showModal();
  }

  async function confirmDeleteChat() {
    if (!deleteTarget) return;
    if (await changeChatState(deleteTarget, 'deleted')) {
      deleteDialog.current.close();
      setDeleteTarget(null);
    }
  }

  function openNewChat() {
    setCreateError('');
    createDialog.current.showModal();
    createDialog.current.querySelector('input')?.focus();
  }

  async function createChat(event) {
    event.preventDefault();
    if (createLock.current || !newChat.name.trim() || !username) return;
    createLock.current = true;
    setCreating(true);
    setCreateError('');
    const author = username;
    const entered = parseChatUsers(newChat.users);
    const users = entered.length === 0 || entered.includes('all') ? ['all'] : [...new Set([...entered, author])];
    try {
      const { data, error } = await supabase.from('Chats').insert({
        name: newChat.name.trim(), description: newChat.description.trim(), users: users.join(','), created_at: new Date().toISOString(),
      }).select('*').single();
      if (error || !data) throw error || new Error('Empty response');
      if (usernameRef.current !== author) return;
      setChats(current => [data, ...current.filter(room => room.id !== data.id)]);
      setListView('active');
      setSelectedId(data.id);
      setNewChat(emptyChat);
      createDialog.current?.close();
    } catch { setCreateError('Could not create the chat. Please try again.'); }
    finally { createLock.current = false; setCreating(false); }
  }

  return (
    <div className="dm-chat-page">
      <Navbar />
      {!username ? (
        <main className="dm-chat-login">
          <IconMessageCircle size={46} stroke={1.4} />
          <h1>Join the conversation</h1>
          <p>Log in to open your chats and send messages.</p>
          <Link className="button_normal" to="/login?returnTo=chat">Log in</Link>
        </main>
      ) : (
        <main className="dm-chat-shell" style={footerHeight ? { '--chat-footer-height': `${footerHeight}px` } : undefined} data-chat-open={Boolean(selectedChat)} data-info-open={showGroupInfo && Boolean(selectedChat)}>
          <aside className="dm-chat-sidebar" aria-label="Conversations">
            <header className="dm-chat-sidebar-header">
              <div><h1>Chats</h1><span>Your conversations</span></div>
              <button className="button_normal dm-chat-icon" type="button" aria-label="New chat" title="New chat" onClick={openNewChat}><IconPlus size={20} /></button>
            </header>
            <div className="dm-chat-rooms">
              {loadingChats ? <p className="dm-chat-notice" role="status">Loading chats…</p> : listError ? (
                <div className="dm-chat-notice" role="alert"><p>{listError}</p><button className="button_normal" onClick={() => setListRevision(value => value + 1)}>Retry</button></div>
              ) : !shownChats.length ? <p className="dm-chat-notice">{listView === 'archived' ? 'No archived chats.' : 'No conversations here. Use + to create one.'}</p> : (
                <ul>{shownChats.map(room => <li key={room.id} className="dm-chat-room-row">
                  <button className={`dm-chat-room ${room.id === selectedId ? 'is-selected' : ''}`} aria-current={room.id === selectedId ? 'true' : undefined} disabled={changingRoom} onClick={() => { setRoomMenuId(null); if (listView !== 'active') changeChatState(room, 'active'); else setSelectedId(room.id); }}>
                    <span className="dm-chat-avatar" aria-hidden="true">{(room.name || '?').slice(0, 1).toUpperCase()}</span>
                    <span className="dm-chat-room-copy"><strong>{room.name}</strong><small>{listView === 'archived' ? 'Unarchive chat' : room.description || 'Open conversation'}</small></span>
                    {listView !== 'active' && <IconRestore size={18} aria-hidden="true" />}
                  </button>
                  <div className="dm-chat-room-actions" ref={roomMenuId === room.id ? roomActionsRef : null}>
                    <button className="dm-chat-room-options" type="button" aria-label={`Options for ${room.name}`} title="Chat options" aria-haspopup="menu" aria-expanded={roomMenuId === room.id} aria-controls={roomMenuId === room.id ? `room-menu-${room.id}` : undefined} disabled={changingRoom} onClick={() => setRoomMenuId(current => current === room.id ? null : room.id)}><IconDots size={18} aria-hidden="true" /></button>
                    {roomMenuId === room.id && <div className="dm-chat-room-menu" role="menu" id={`room-menu-${room.id}`} aria-label={`Options for ${room.name}`} onKeyDown={event => {
                      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                        event.preventDefault();
                        const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]')];
                        const index = items.indexOf(document.activeElement);
                        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
                        items[next]?.focus();
                      }
                      if (event.key === 'Tab') setRoomMenuId(null);
                    }}>
                        <button type="button" role="menuitem" disabled={changingRoom} onClick={() => changeChatState(room, listView === 'archived' ? 'active' : 'archived')}>{listView === 'archived' ? <IconRestore size={17} /> : <IconArchive size={17} />}{listView === 'archived' ? 'Unarchive chat' : 'Archive chat'}</button>
                        <button className="dm-chat-delete-action" type="button" role="menuitem" disabled={changingRoom} title="Eliminar y salir del grupo" onClick={() => requestDeleteChat(room)}><IconTrash size={17} />Eliminar y salir del grupo</button>
                    </div>}
                  </div>
                </li>)}</ul>
              )}
              {!loadingChats && !listError && <>
                {listView !== 'active' && <button className="button_normal dm-chat-hidden-toggle" type="button" onClick={() => setListView('active')}><IconArrowLeft size={16} />Back to chats</button>}
                {listView !== 'archived' && hiddenChats.length > 0 && <button className="button_normal dm-chat-hidden-toggle" type="button" onClick={() => setListView('archived')}><IconArchive size={16} />Archived chats ({hiddenChats.length})</button>}
              </>}
              {roomActionError && <p className="dm-chat-notice" role="alert">{roomActionError}</p>}
            </div>
            <footer className="dm-chat-account"><span className="dm-chat-avatar" aria-hidden="true">{username.slice(0, 1).toUpperCase()}</span><div><strong>{username}</strong><small>Signed in</small></div></footer>
          </aside>
          <section className="dm-chat-conversation" aria-label={selectedChat?.name || 'Conversation'}>
            {!selectedChat ? <div className="dm-chat-empty"><IconMessageCircle size={56} stroke={1.2} /><h2>A space to talk</h2><p>Select a conversation from the list<br />or create a new chat with +.</p></div> : <>
              <header className="dm-chat-header">
                <button className="button_normal dm-chat-icon dm-chat-back" type="button" aria-label="Back to chats" title="Cerrar conversación" onClick={() => setSelectedId(null)}><IconArrowLeft size={20} /></button>
                <button className="dm-chat-group-title" type="button" onClick={openGroupInfo} aria-label={`Información de ${selectedChat.name}`}>
                  <span className="dm-chat-avatar" aria-hidden="true">{(selectedChat.name || '?').slice(0, 1).toUpperCase()}</span>
                  <span className="dm-chat-heading"><strong>{groupInfo?.id === selectedId ? groupInfo.name : selectedChat.name}</strong><small>{selectedChat.description || 'Información del grupo'}</small></span>
                </button>
                <button className="dm-chat-header-members" type="button" onClick={openGroupInfo} title={membersLabel} aria-label={`Participantes: ${membersLabel}`}><IconUsers size={16} aria-hidden="true" /><span>{membersLabel}</span></button>
                <div className="dm-chat-header-actions" ref={roomMenuId === 'header' ? roomActionsRef : null}>
                  <button className="button_normal dm-chat-icon" type="button" aria-label="Opciones del grupo" aria-haspopup="menu" aria-expanded={roomMenuId === 'header'} aria-controls={roomMenuId === 'header' ? 'header-group-menu' : undefined} onClick={() => setRoomMenuId(current => current === 'header' ? null : 'header')}><IconDots size={20} /></button>
                  {roomMenuId === 'header' && <div className="dm-chat-room-menu" id="header-group-menu" role="menu" aria-label="Opciones del grupo" onKeyDown={event => {
                    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                      event.preventDefault();
                      const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]')];
                      const index = items.indexOf(document.activeElement);
                      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
                      items[next]?.focus();
                    }
                    if (event.key === 'Tab') setRoomMenuId(null);
                  }}>
                    <button type="button" role="menuitem" onClick={openGroupInfo}><IconInfoCircle size={17} />Información del grupo</button>
                    <button type="button" role="menuitem" disabled={changingRoom} onClick={() => changeChatState(selectedChat, 'archived')}><IconArchive size={17} />Archive chat</button>
                    <button className="dm-chat-delete-action" type="button" role="menuitem" disabled={changingRoom} onClick={() => requestDeleteChat(selectedChat)}><IconTrash size={17} />Eliminar y salir del grupo</button>
                  </div>}
                </div>
              </header>
              <div className="dm-chat-messages" ref={messagePane} onScroll={event => {
                const el = event.currentTarget;
                shouldFollow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }} aria-busy={loadingMessages}>
                {loadingMessages ? <p className="dm-chat-notice" role="status">Loading messages…</p> : messageError ? (
                  <div className="dm-chat-notice" role="alert"><p>{messageError}</p><button className="button_normal" onClick={() => setMessageRevision(value => value + 1)}>Retry</button></div>
                ) : !timeline.length ? <div className="dm-chat-empty dm-chat-empty-small"><IconMessageCircle size={36} stroke={1.4} /><p>No messages yet.<br />Say hello to start the conversation.</p></div> : (
                  <ol aria-label="Messages">{timeline.map((message, index) => <Fragment key={messageKey(message)}>
                    {messageDayKey(message.created_at) && (index === 0 || messageDayKey(message.created_at) !== messageDayKey(timeline[index - 1].created_at)) && <li className="dm-chat-day"><time dateTime={messageDayKey(message.created_at)}>{formatMessageDate(message.created_at)}</time></li>}
                    {message.systemEvent ? <li className="dm-chat-day dm-chat-system"><span>{message.user} ha dejado el grupo</span></li> : <li data-message-id={messageKey(message)} data-message-author={message.user} className={`dm-chat-message ${message.user === username ? 'is-own' : ''}`}>
                    {message.user !== username && <span className="dm-chat-avatar dm-chat-message-avatar" aria-hidden="true">{(message.user || '?').slice(0, 1).toUpperCase()}</span>}
                    <div className="dm-chat-bubble">
                      {message.user !== username && <strong className="dm-chat-author">{message.user || 'Unknown user'}</strong>}
                      <p className="dm-chat-message-text">{message.text}<span className="dm-chat-message-meta">
                        <time dateTime={message.created_at} title={new Date(message.created_at).toLocaleString()}>{formatMessageTime(message.created_at)}</time>
                        {message.user === username && <MessageChecks status={statuses[messageKey(message)] || 'sent'} />}
                      </span></p>
                    </div>
                  </li>}</Fragment>)}</ol>
                )}
              </div>
              <form ref={composerForm} className="dm-chat-composer" onSubmit={sendMessage}>
                {receiptError && <p className="dm-chat-send-error" role="status">{receiptError}</p>}
                {sendError && <p className="dm-chat-send-error" role="alert">{sendError}</p>}
                <div className="dm-chat-compose-row">
                  <div className="dm-chat-emoji-wrap" ref={emojiPanel}>
                    <button className="button_normal dm-chat-icon" type="button" aria-label="Choose emoji" aria-expanded={showEmoji} onClick={() => setShowEmoji(value => !value)}><IconMoodSmile size={22} /></button>
                    {showEmoji && <div className="dm-chat-emojis" role="group" aria-label="Emojis">{EMOJIS.map(emoji => <button type="button" key={emoji} aria-label={emoji} onClick={() => { updateDraft(draft + emoji); composer.current?.focus(); }}>{emoji}</button>)}</div>}
                  </div>
                  <textarea ref={composer} rows={2} aria-label="Message" placeholder="Type a message…" value={draft} onChange={event => updateDraft(event.target.value)} onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendMessage(); }
                  }} />
                  <button className="button_normal dm-chat-send" aria-label={sending ? 'Sending…' : 'Send'} type="submit" disabled={sending || !draft.trim()}><IconSend size={18} /><span>{sending ? 'Sending…' : 'Send'}</span></button>
                </div>
                <small className="dm-chat-compose-help">Enter to send · Shift + Enter for a new line</small>
              </form>
            </>}
          </section>
          {showGroupInfo && selectedChat && <aside className="dm-chat-group-info" aria-label="Información del grupo">
            <header><button ref={infoClose} className="button_normal dm-chat-icon" type="button" aria-label="Cerrar información del grupo" onClick={closeGroupInfo}><IconX size={20} /></button><h2>Info. del grupo</h2></header>
            <div className="dm-chat-info-body">
              <div className="dm-chat-info-summary"><span className="dm-chat-avatar dm-chat-info-avatar" aria-hidden="true">{(selectedChat.name || '?').slice(0, 1).toUpperCase()}</span><h3>{groupInfo?.id === selectedId ? groupInfo.name : selectedChat.name}</h3><p>{groupInfo?.id === selectedId ? `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}` : 'Cargando miembros…'}</p></div>
              <section className="dm-chat-info-section"><h3>Descripción</h3><p>{groupInfo?.id === selectedId ? groupInfo.description || 'Sin descripción' : selectedChat.description || 'Sin descripción'}</p>
                {messageDayKey(selectedChat.created_at) && <p className="dm-chat-info-created"><IconCalendar size={16} aria-hidden="true" />Creado el {formatMessageDate(selectedChat.created_at)}</p>}
              </section>
              <section className="dm-chat-info-section"><h3><IconUsers size={17} aria-hidden="true" />Participantes{groupInfo?.id === selectedId ? ` · ${members.length}` : ''}</h3>
                {groupInfo?.id !== selectedId ? <p role="status">Cargando participantes…</p> : <ul className="dm-chat-info-members">{members.map(member => <li key={member}><span className="dm-chat-avatar" aria-hidden="true">{member.slice(0, 1).toUpperCase()}</span><span>{member}{member === username && <small>Tú</small>}</span></li>)}</ul>}
              </section>
              <button className="dm-chat-info-leave" type="button" disabled={changingRoom} onClick={() => requestDeleteChat(selectedChat)}><IconTrash size={18} />Eliminar y salir del grupo</button>
            </div>
          </aside>}
        </main>
      )}
      <dialog className="dm-chat-dialog" ref={deleteDialog} aria-labelledby="delete-chat-title" onCancel={event => { if (changingRoom) event.preventDefault(); else setDeleteTarget(null); }}>
        <h2 id="delete-chat-title">¿Eliminar y salir del grupo?</h2>
        <p>Eliminarás “{deleteTarget?.name}” definitivamente de tu cuenta. No podrás recuperarlo. Los demás conservarán la conversación y verán que has dejado el grupo.</p>
        {roomActionError && <p className="dm-chat-send-error" role="alert">{roomActionError}</p>}
        <footer>
          <button autoFocus className="button_normal" type="button" disabled={changingRoom} onClick={() => { deleteDialog.current.close(); setDeleteTarget(null); }}>Cancel</button>
          <button className="button_normal dm-chat-delete-confirm" type="button" disabled={changingRoom} onClick={confirmDeleteChat}>{changingRoom ? 'Eliminando…' : 'Eliminar y salir'}</button>
        </footer>
      </dialog>
      <dialog className="dm-chat-dialog" ref={createDialog} aria-labelledby="new-chat-title" onCancel={event => { if (creating) event.preventDefault(); }}>
        <header><h2 id="new-chat-title">New chat</h2><button type="button" className="button_normal dm-chat-icon" aria-label="Close" disabled={creating} onClick={() => createDialog.current.close()}><IconX size={20} /></button></header>
        <form onSubmit={createChat}>
          <label>Name<input autoFocus required maxLength={60} value={newChat.name} onChange={event => setNewChat(current => ({ ...current, name: event.target.value }))} disabled={creating} placeholder="Give your conversation a name" /></label>
          <label>Description <span>(optional)</span><input maxLength={200} value={newChat.description} onChange={event => setNewChat(current => ({ ...current, description: event.target.value }))} disabled={creating} placeholder="What is this chat about?" /></label>
          <label>Users <span>(optional)</span><input value={newChat.users} onChange={event => setNewChat(current => ({ ...current, users: event.target.value }))} disabled={creating} placeholder="username1, username2" /></label>
          <small>Leave users empty for all users. Otherwise, separate usernames with commas; you are included automatically.</small>
          {createError && <p role="alert" className="dm-chat-send-error">{createError}</p>}
          <footer><button className="button_normal" type="button" disabled={creating} onClick={() => createDialog.current.close()}>Cancel</button><button className="button_normal" disabled={creating || !newChat.name.trim()}>{creating ? 'Creating…' : 'Create chat'}</button></footer>
        </form>
      </dialog>
    </div>
  );
}
