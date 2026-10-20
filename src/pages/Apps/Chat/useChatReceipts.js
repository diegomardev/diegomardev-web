import { useEffect, useRef, useState } from 'react';
import { getPixelArtToken, pixelArtSupabase as supabase } from '../../../lib/pixelArtSession';

// Polling keeps receipts persistent across reconnects without exposing the
// receipt table or depending on the project's Realtime publication settings.
export function useChatReceipts({ username, selectedId, messages, messagePane }) {
  const [groupInfo, setGroupInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [receiptError, setReceiptError] = useState('');
  const visible = useRef(new Set());
  const syncRef = useRef(() => {});
  const room = useRef(selectedId);
  room.current = selectedId;

  useEffect(() => {
    let active = true;
    let running = false;
    let timer;
    const received = new Set();
    const read = new Set();
    setGroupInfo(null);
    setEvents([]);
    setStatuses({});
    if (!username) return;
    async function sync() {
      if (!active || running) return;
      clearTimeout(timer);
      const token = getPixelArtToken();
      if (!token) {
        setReceiptError('Sign in again to confirm message delivery and reading.');
        timer = setTimeout(sync, 3000);
        return;
      }
      running = true;
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        for (const id of visible.current) read.add(id);
      }
      const receivedBatch = [...received].slice(0, 1000);
      const readBatch = [...read].slice(0, 1000);
      const requestedRoom = room.current;
      let retryImmediately = false;
      try {
        const [{ data, error }, activity, info] = await Promise.all([supabase.rpc('chat_sync_receipts', {
          p_token: token, p_chat_id: requestedRoom,
          p_received: receivedBatch, p_read: readBatch,
        }), requestedRoom ? supabase.rpc('chat_room_events', { p_token: token, p_chat_id: requestedRoom }) : Promise.resolve({ data: [] }), requestedRoom ? supabase.rpc('chat_group_info', { p_token: token, p_chat_id: requestedRoom }) : Promise.resolve({ data: null })]);
        if (!active) return;
        if (error) throw error;
        for (const id of receivedBatch) received.delete(id);
        for (const id of readBatch) read.delete(id);
        // The response includes message contents: ACK only after receiving it.
        for (const message of data.inbox || []) received.add(String(message.message_id));
        if (room.current === requestedRoom) {
          setStatuses(data.statuses || {});
          if (!info.error) setGroupInfo(current => JSON.stringify(current) === JSON.stringify(info.data) ? current : info.data);
          if (!activity.error) setEvents(current => JSON.stringify(current) === JSON.stringify(activity.data || []) ? current : activity.data || []);
        }
        setReceiptError(activity.error || info.error ? 'Could not load group information. Retrying…' : '');
        retryImmediately = received.size > 0 || room.current !== requestedRoom;
      } catch (error) {
        if (active) setReceiptError(error.code === '28000'
          ? 'Sign in again to confirm message delivery and reading.'
          : 'Message confirmations unavailable. Retrying…');
      } finally {
        running = false;
        if (active) timer = setTimeout(sync, retryImmediately ? 50 : 3000);
      }
    }
    syncRef.current = sync;
    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      active = false;
      clearTimeout(timer);
      syncRef.current = () => {};
      window.removeEventListener('focus', sync);
      window.removeEventListener('online', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [username]);

  useEffect(() => {
    setGroupInfo(null);
    setEvents([]);
    setStatuses({});
    visible.current.clear();
    syncRef.current();
  }, [selectedId]);

  useEffect(() => {
    visible.current.clear();
    const root = messagePane.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const id = entry.target.dataset.messageId;
        // At least part of a long message must be visible; hidden tabs and
        // unfocused windows are excluded again when the ACK is assembled.
        if (entry.isIntersecting && entry.intersectionRect.height >= Math.min(20, entry.boundingClientRect.height)) visible.current.add(id);
        else visible.current.delete(id);
      }
      syncRef.current();
    }, { root, threshold: [0, 0.01, 0.5, 1] });
    for (const element of root.querySelectorAll('[data-message-id]')) {
      if (element.dataset.messageAuthor !== username) observer.observe(element);
    }
    return () => { observer.disconnect(); visible.current.clear(); };
  }, [messages, selectedId, username, messagePane]);

  return { statuses, receiptError, events, groupInfo };
}
