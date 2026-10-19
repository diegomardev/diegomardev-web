import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconMessageCircle, IconMoodSmile, IconPlus, IconSend, IconX } from '@tabler/icons-react';
import Navbar from '../../../components/Navbar/Navbar';
import { pixelArtSupabase as supabase } from '../../../lib/pixelArtSession';
import { useChatReceipts } from './useChatReceipts';
import { MessageChecks } from './MessageChecks';
import { canViewChat, formatMessageTime, mergeMessages, messageKey, parseChatUsers } from './chatUtils';
import './Chat.css';

const EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '😎', '😍', '🤔'];
const emptyChat = { name: '', description: '', users: '' };

export default function Chat() {
  const [footerHeight, setFooterHeight] = useState(0);
  const composerForm = useRef(null);
  const [username, setUsername] = useState(() => localStorage.getItem('user_logged'));
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
  const [connection, setConnection] = useState('connecting');
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
  const selectedChat = chats.find(room => room.id === selectedId);
  const draft = drafts[selectedId] || '';
  const { statuses, receiptError } = useChatReceipts({ username, selectedId, messages, messagePane });

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
        const { data, error } = await supabase.from('Chats').select('*').order('created_at', { ascending: false });
        if (!active) return;
        if (error) throw error;
        const visible = (data || []).filter(room => canViewChat(room, username));
        setChats(visible);
        setSelectedId(current => visible.some(room => room.id === current) ? current : null);
      } catch {
        if (active) setListError('Could not load your chats.');
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
    setConnection('connecting');
    const channel = supabase.channel(`chat-messages-${selectedId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages', filter: `chat_id=eq.${selectedId}` }, payload => {
        if (active && payload.new.chat_id === selectedId) setMessages(current => mergeMessages(current, [payload.new]));
      })
      .subscribe(status => {
        if (!active) return;
        setConnection(status === 'SUBSCRIBED' ? 'live' : 'connecting');
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
  }, [messages, loadingMessages]);

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
      const { data, error } = await supabase.from('Messages').insert({
        chat_id: roomId, text: originalDraft.trim(), user: author, created_at: new Date().toISOString(),
      }).select('*').single();
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
        <main className="dm-chat-shell" style={footerHeight ? { '--chat-footer-height': `${footerHeight}px` } : undefined} data-chat-open={Boolean(selectedChat)}>
          <aside className="dm-chat-sidebar" aria-label="Conversations">
            <header className="dm-chat-sidebar-header">
              <div><h1>Chats</h1><span>Your conversations</span></div>
              <button className="button_normal dm-chat-icon" type="button" aria-label="New chat" title="New chat" onClick={openNewChat}><IconPlus size={20} /></button>
            </header>
            <div className="dm-chat-rooms">
              {loadingChats ? <p className="dm-chat-notice" role="status">Loading chats…</p> : listError ? (
                <div className="dm-chat-notice" role="alert"><p>{listError}</p><button className="button_normal" onClick={() => setListRevision(value => value + 1)}>Retry</button></div>
              ) : !chats.length ? <p className="dm-chat-notice">No conversations yet. Use + to create one.</p> : (
                <ul>{chats.map(room => <li key={room.id}>
                  <button className={`dm-chat-room ${room.id === selectedId ? 'is-selected' : ''}`} aria-current={room.id === selectedId ? 'true' : undefined} onClick={() => setSelectedId(room.id)}>
                    <span className="dm-chat-avatar" aria-hidden="true">{(room.name || '?').slice(0, 1).toUpperCase()}</span>
                    <span className="dm-chat-room-copy"><strong>{room.name}</strong><small>{room.description || 'Open conversation'}</small></span>
                  </button>
                </li>)}</ul>
              )}
            </div>
            <footer className="dm-chat-account"><span className="dm-chat-avatar" aria-hidden="true">{username.slice(0, 1).toUpperCase()}</span><div><strong>{username}</strong><small>Signed in</small></div></footer>
          </aside>
          <section className="dm-chat-conversation" aria-label={selectedChat?.name || 'Conversation'}>
            {!selectedChat ? <div className="dm-chat-empty"><IconMessageCircle size={56} stroke={1.2} /><h2>A space to talk</h2><p>Select a conversation from the list<br />or create a new chat with +.</p></div> : <>
              <header className="dm-chat-header">
                <button className="button_normal dm-chat-icon dm-chat-back" aria-label="Back to chats" onClick={() => setSelectedId(null)}><IconArrowLeft size={20} /></button>
                <span className="dm-chat-avatar" aria-hidden="true">{(selectedChat.name || '?').slice(0, 1).toUpperCase()}</span>
                <div className="dm-chat-heading"><h2>{selectedChat.name}</h2><p>{selectedChat.description || 'Conversation'}</p></div>
                <span className={`dm-chat-connection ${connection === 'live' ? 'is-live' : ''}`} role="status">{connection === 'live' ? 'Live' : 'Connecting…'}</span>
              </header>
              <div className="dm-chat-messages" ref={messagePane} onScroll={event => {
                const el = event.currentTarget;
                shouldFollow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }} aria-busy={loadingMessages}>
                {loadingMessages ? <p className="dm-chat-notice" role="status">Loading messages…</p> : messageError ? (
                  <div className="dm-chat-notice" role="alert"><p>{messageError}</p><button className="button_normal" onClick={() => setMessageRevision(value => value + 1)}>Retry</button></div>
                ) : !messages.length ? <div className="dm-chat-empty dm-chat-empty-small"><IconMessageCircle size={36} stroke={1.4} /><p>No messages yet.<br />Say hello to start the conversation.</p></div> : (
                  <ol aria-label="Messages">{messages.map(message => <li key={messageKey(message)} data-message-id={messageKey(message)} data-message-author={message.user} className={`dm-chat-message ${message.user === username ? 'is-own' : ''}`}>
                    {message.user !== username && <span className="dm-chat-avatar dm-chat-message-avatar" aria-hidden="true">{(message.user || '?').slice(0, 1).toUpperCase()}</span>}
                    <div className="dm-chat-bubble">
                      {message.user !== username && <strong className="dm-chat-author">{message.user || 'Unknown user'}</strong>}
                      <p className="dm-chat-message-text">{message.text}<span className="dm-chat-message-meta">
                        <time dateTime={message.created_at} title={new Date(message.created_at).toLocaleString()}>{formatMessageTime(message.created_at)}</time>
                        {message.user === username && <MessageChecks status={statuses[messageKey(message)] || 'sent'} />}
                      </span></p>
                    </div>
                  </li>)}</ol>
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
        </main>
      )}
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
