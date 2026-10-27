import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './PixelMB.css';
import AnimationPreview from './AnimationPreview';

const ASSETS = '/apps/pixel-mb/';
const PAGE_SIZE = 24;
function filename(item) {
  const name = item.slug.replace(/[^A-Za-z0-9_-]/g, '_');
  return (item.id.startsWith('local_') ? name.slice(0, 20) : name.slice(0, 15) + '_' + item.id.slice(-4)) + '.json';
}

export default function PixelMB() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState('compatible');
  const [motion, setMotion] = useState('animated');
  const [origin, setOrigin] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const oldTitle = document.title;
    const oldLang = document.documentElement.lang;
    document.title = 'Pixel-MB · Animation Library';
    document.documentElement.lang = 'en';
    async function load() {
      try {
        const response = await fetch(ASSETS + 'catalog.json', { signal: controller.signal });
        if (!response.ok) throw new Error('Could not load the catalog.');
        const data = await response.json();
        if (!Array.isArray(data.items)) throw new Error('Invalid animation catalog.');
        setCatalog(data.items);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load the catalog. Please reload the page to try again.');
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      controller.abort();
      document.title = oldTitle;
      document.documentElement.lang = oldLang;
    };
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return catalog.filter(item => item.status === 'ready'
      && (!search || (item.title + ' ' + item.slug + ' ' + item.origin).toLocaleLowerCase().includes(search))
      && (size === 'all' || (size === 'compatible' ? item.compatible : item.width + 'x' + item.height === size))
      && (motion === 'all' || item.animated === (motion === 'animated'))
      && (origin === 'all' || item.id.startsWith(origin + '_')));
  }, [catalog, query, size, motion, origin]);
  const start = page * PAGE_SIZE;
  const count = filtered.length;
  function change(setter) {
    return event => { setter(event.target.value); setPage(0); };
  }
  const status = loading ? 'Loading…' : error || (count
    ? `${start + 1}–${Math.min(start + PAGE_SIZE, count)} of ${count.toLocaleString('en')} results`
    : 'No results match these filters.');

  return (
    <div className="pixel-mb">
      <header>
        <Link className="brand" to="/apps/pixel-mb"><span className="brandmark" aria-hidden="true">▦</span> PIXEL<span>-MB</span></Link>
        <span className="eyebrow">PIXEL ART LIBRARY</span>
        <Link className="back-link" to="/apps">← Back to DiegoMarDev</Link>
      </header>
      <main>
        <section className="toolbar" aria-label="Search and filter">
          <label className="search" htmlFor="pixelmb-search">Search animations<input id="pixelmb-search" type="search" placeholder="Matrix, fire, cats, space…" autoComplete="off" value={query} onChange={change(setQuery)} /></label>
          <label htmlFor="pixelmb-size">Size<select id="pixelmb-size" value={size} onChange={change(setSize)}><option value="compatible">Fits my 32×8 matrix</option><option value="32x8">Full screen · 32×8</option><option value="8x8">Icons · 8×8</option><option value="all">All sizes</option></select></label>
          <label htmlFor="pixelmb-motion">Motion<select id="pixelmb-motion" value={motion} onChange={change(setMotion)}><option value="animated">Animations</option><option value="all">Animations and images</option><option value="static">Still images</option></select></label>
          <label htmlFor="pixelmb-origin">Source<select id="pixelmb-origin" value={origin} onChange={change(setOrigin)}><option value="all">All</option><option value="local">Pixel-MB project</option><option value="hub">AWTRIX Hub</option></select></label>
        </section>
        <section className="collection" aria-label="Animation library">
          <div className="grid">
            {filtered.slice(start, start + PAGE_SIZE).map(item => (
              <article key={item.id} className={'card' + (item.width > item.height ? ' wide' : '')}>
                <div className="thumbnail">
                  <AnimationPreview src={ASSETS + item.json} title={item.title} width={item.width} height={item.height} />
                  <span className="motion">{item.animated ? '▶ ANIMATED' : 'IMAGE'}</span>
                </div>
                <div className="card-heading">
                  <h3 title={item.title}>{item.title}</h3>
                  <a className={'card-download' + (item.json ? '' : ' disabled')} href={item.json ? ASSETS + item.json : undefined} download={filename(item)} aria-disabled={!item.json} aria-label={'Download JSON for ' + item.title}>Download</a>
                </div>
                <p>{item.width}×{item.height} · {item.sourceFrames} frames{item.compatible ? '' : ' · other size'}</p>
              </article>
            ))}
            {!loading && !error && !count && <p className="empty">Try a different name, size, or motion type.</p>}
          </div>
          <div className="pagination-row">
            <nav className="pagination" aria-label="Pages">
              <button disabled={loading || page === 0} onClick={() => setPage(value => Math.max(0, value - 1))}>← Previous</button>
              <span>{page + 1} / {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span>
              <button disabled={loading || start + PAGE_SIZE >= count} onClick={() => setPage(value => value + 1)}>Next →</button>
            </nav>
            <p className="result-count" role="status">{status}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
