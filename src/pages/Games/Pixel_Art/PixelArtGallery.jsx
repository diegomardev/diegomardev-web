import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPixelArtToken, PIXEL_ART_SESSION_KEY, pixelArtSupabase as supabase } from '../../../lib/pixelArtSession';
import './PixelArtGallery.css';

const PAGE_SIZE = 6;
const artworkNumber = item => `#${String(item.artwork_number).padStart(4, '0')}`;

function Artwork({ colors, title }) {
  return (
    <div className="gallery-art" role="img" aria-label={title}>
      {colors.map((column, x) => (
        <div key={x} className="gallery-art-column">
          {column.map((color, y) => <span key={y} style={{ backgroundColor: color }} />)}
        </div>
      ))}
    </div>
  );
}

export default function PixelArtGallery({ pixels, ready, pending }) {
  const [author, setAuthor] = useState(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const saveLock = useRef(false);
  const request = useRef(0);

  const checkSession = useCallback(async () => {
    const token = getPixelArtToken();
    setChecking(true);
    if (!token) { setAuthor(null); setChecking(false); return; }
    try {
      const { data, error } = await supabase.rpc('pixel_art_session_user', { p_token: token });
      setAuthor(error ? null : data);
    } catch { setAuthor(null); }
    finally { setChecking(false); }
  }, []);

  useEffect(() => {
    checkSession();
    const onStorage = (event) => { if (event.key === PIXEL_ART_SESSION_KEY || event.key === null) checkSession(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', checkSession);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', checkSession);
    };
  }, [checkSession]);

  useEffect(() => {
    const id = ++request.current;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data, count, error } = await supabase.from('pixel_art_gallery')
          .select('id,artwork_number,title,author,colors', { count: 'exact' })
          .order('artwork_number', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        if (id !== request.current) return;
        if (error) throw error;
        const lastPage = Math.max(0, Math.ceil(count / PAGE_SIZE) - 1);
        if (page > lastPage) { setPage(lastPage); return; }
        setItems(data);
        setCount(count);
      } catch {
        if (id === request.current) setError('Could not load the gallery. Please try again.');
      } finally { if (id === request.current) setLoading(false); }
    }
    load();
    return () => { request.current++; };
  }, [page, revision]);

  useEffect(() => {
    if (selected) dialog.current.showModal();
  }, [selected]);

  async function save(event) {
    event.preventDefault();
    if (saveLock.current || !author || !ready || pending) return;
    saveLock.current = true;
    setSaving(true);
    setMessage('');
    // Snapshot colors before the asynchronous call; don't publish hover names.
    const colors = pixels.map(column => column.map(pixel => pixel[0]));
    try {
      const { error } = await supabase.rpc('save_pixel_art', {
        p_token: getPixelArtToken(), p_title: title.trim() || 'Pixel Art', p_colors: colors,
      });
      if (error) throw error;
      setTitle('');
      setMessage('Creation saved to the gallery!');
      setPage(0);
      setRevision(value => value + 1);
    } catch (error) {
      if (error.code === '28000') {
        setAuthor(null);
        localStorage.removeItem(PIXEL_ART_SESSION_KEY);
        setMessage('Your session has expired. Log in again to save.');
      } else if (error.message?.includes('10 seconds')) {
        setMessage('Please wait 10 seconds before saving again.');
      } else { setMessage('Could not save your creation. Please try again.'); }
    } finally { setSaving(false); saveLock.current = false; }
  }

  return (
    <section className="pixel-gallery" aria-label="Saved pixel art creations">
      <div className="gallery-save">
        {author ? (
          <form className="gallery-save-controls" onSubmit={save}>
            <input className="gallery-title-input" aria-label="Creation name (optional)" placeholder="Name (optional)" value={title} onChange={event => setTitle(event.target.value)} maxLength={60} disabled={saving} />
            <button className="button_normal gallery-save-button" disabled={checking || saving || !ready || pending}>
              {saving ? 'Saving…' : 'Save creation'}
            </button>
          </form>
        ) : checking ? <button className="button_normal" disabled>Checking session…</button>
          : <Link className="button_normal gallery-save-button gallery-login" to="/login?returnTo=pixel-art">Log in to save</Link>}
        <p role="status" className="gallery-message">{message}</p>
      </div>
      <div aria-busy={loading}>
        {loading ? <p role="status">Loading creations…</p> : error ? (
          <p role="alert">{error} <button className="button_normal" onClick={() => setRevision(value => value + 1)}>Retry</button></p>
        ) : items.length === 0 ? <div className="gallery-empty">No creations yet. Be the first to save one!</div> : (
          <div className="gallery-row">
            {items.map(item => (
              <button key={item.id} className="gallery-card" onClick={() => setSelected(item)} aria-label={`View ${item.title}, ${artworkNumber(item)} by ${item.author}`}>
                <strong className="gallery-card-title" title={item.title}>{item.title}</strong>
                <Artwork colors={item.colors} title={`${item.title} ${artworkNumber(item)}`} />
                <span className="gallery-card-meta">
                  <span className="gallery-card-number">{artworkNumber(item)}</span>
                  <span className="gallery-card-author" title={`by ${item.author}`}>by {item.author}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <nav className="gallery-pagination" aria-label="Gallery pages">
        <button className="button_normal" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)}>Previous</button>
        <span aria-live="polite">Page {page + 1} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span>
        <button className="button_normal" disabled={loading || (page + 1) * PAGE_SIZE >= count} onClick={() => setPage(value => value + 1)}>Next</button>
      </nav>
      <dialog ref={dialog} className="gallery-dialog" onClose={() => setSelected(null)} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }} aria-labelledby="artwork-heading">
        {selected && <>
          <h2 id="artwork-heading">{selected.title}</h2>
          <Artwork colors={selected.colors} title={artworkNumber(selected)} />
          <p className="gallery-card-meta"><span className="gallery-card-number">{artworkNumber(selected)}</span><span className="gallery-card-author" title={`by ${selected.author}`}>by {selected.author}</span></p>
          <button autoFocus className="button_normal" onClick={() => dialog.current.close()}>Close</button>
        </>}
      </dialog>
    </section>
  );
}
