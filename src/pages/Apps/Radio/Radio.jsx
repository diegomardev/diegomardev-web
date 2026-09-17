import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import radiosData from '../../../assets/radios/radios.json';
import './Radio.css';

const MAX_GLOBAL_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const RADIOS_PER_PAGE = 9;
const FAVORITES_STORAGE_KEY = 'favorite_radios_keys_v2';
const PLAYBACK_STORAGE_KEY = 'radio_playback_state_v1';

const CATEGORY_PRIORITY = {
  Musicales: 1,
  Nacionales: 2,
  Autonómicas: 3,
  Deportivas: 4,
  Infantiles: 5,
  General: 6,
};

const DEFAULT_FAVORITE_KEYS = [
  'Cadena100.Radio',
  'CadenaDial.Radio',
  'Los40Classic.Radio',
  'Los40.Radio',
  'EuropaFM.Radio',
  'KissFm.Radio',
  'autonomicas-galicia-verbena-fm',
  'autonomicas-c-valenciana-motiva',
  'RockFM.Radio',
];

function readSavedPlayback() {
  try {
    const savedPlayback = localStorage.getItem(PLAYBACK_STORAGE_KEY);
    const parsedPlayback = savedPlayback ? JSON.parse(savedPlayback) : null;

    if (
      parsedPlayback &&
      typeof parsedPlayback.radioKey === 'string' &&
      typeof parsedPlayback.isPlaying === 'boolean'
    ) {
      return parsedPlayback;
    }
  } catch (error) {
    console.error('Error leyendo el estado de la radio:', error);
  }

  return { radioKey: null, isPlaying: false };
}

function RadioPlayer({
  playerId,
  streamUrl,
  onPlayerPlay,
  onPlayerPause,
  shouldAutoPlay,
  registerPlayer,
  consumeGlobalRetry,
}) {
  const audioRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearRetryTimeout();

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();

    try {
      audio.currentTime = 0;
    } catch {
      // Algunos streams en directo no permiten mover currentTime
    }
  }, [clearRetryTimeout]);

  useEffect(() => {
    registerPlayer(playerId, { stop });

    return () => {
      clearRetryTimeout();
      registerPlayer(playerId, null);
    };
  }, [playerId, registerPlayer, stop, clearRetryTimeout]);

  useEffect(() => {
    if (!shouldAutoPlay) return;

    audioRef.current?.play().catch(() => {});
  }, [shouldAutoPlay, streamUrl]);

  const resumePlayback = useCallback(() => {
    if (!shouldAutoPlay) return;

    audioRef.current?.play().catch(() => {});
  }, [shouldAutoPlay]);

  useEffect(() => {
    if (!shouldAutoPlay) return undefined;

    const resumeAfterUserInteraction = () => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.play().catch(() => {});
    };

    window.addEventListener('pointerdown', resumeAfterUserInteraction, {
      once: true,
    });
    window.addEventListener('keydown', resumeAfterUserInteraction, {
      once: true,
    });

    return () => {
      window.removeEventListener('pointerdown', resumeAfterUserInteraction);
      window.removeEventListener('keydown', resumeAfterUserInteraction);
    };
  }, [shouldAutoPlay]);

  const attemptRecovery = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearRetryTimeout();

    const canRetry = consumeGlobalRetry();

    if (!canRetry) {
      audio.pause();
      return;
    }

    retryTimeoutRef.current = window.setTimeout(() => {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      currentAudio.load();
      currentAudio.play().catch(() => {});
    }, RETRY_DELAY_MS);
  }, [clearRetryTimeout, consumeGlobalRetry]);

  return (
    <audio
      ref={audioRef}
      src={streamUrl}
      controls
      preload={shouldAutoPlay ? 'auto' : 'none'}
      autoPlay={shouldAutoPlay}
      className="radio-card__audio"
      onPlay={() => onPlayerPlay(playerId)}
      onPause={() => onPlayerPause(playerId)}
      onCanPlay={resumePlayback}
      onEnded={attemptRecovery}
      onError={attemptRecovery}
    >
      Tu navegador no soporta audio HTML5.
    </audio>
  );
}

function Radio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [savedPlayback] = useState(readSavedPlayback);
  const [pendingAutoPlayKey, setPendingAutoPlayKey] = useState(
    savedPlayback.isPlaying ? savedPlayback.radioKey : null
  );
  const searchInputRef = useRef(null);

  const playersRef = useRef(new Map());
  const activePlayerIdRef = useRef(null);
  const globalRetryCountRef = useRef(0);
  const hasRestoredPageRef = useRef(false);

  const getRadioFavoriteKey = (radio) =>
    radio.favoriteKey || radio.epgId || radio.slug || String(radio.id);

  const resetGlobalRetryCount = useCallback(() => {
    globalRetryCountRef.current = 0;
  }, []);

  const consumeGlobalRetry = useCallback(() => {
    if (globalRetryCountRef.current >= MAX_GLOBAL_RETRIES) {
      return false;
    }

    globalRetryCountRef.current += 1;
    return true;
  }, []);

  const registerPlayer = useCallback((playerId, controls) => {
    if (!controls) {
      playersRef.current.delete(playerId);
      return;
    }

    playersRef.current.set(playerId, controls);
  }, []);

  const handlePlayerPlay = useCallback(
    (playerId) => {
      const activePlayerId = activePlayerIdRef.current;

      if (activePlayerId && activePlayerId !== playerId) {
        const previousPlayer = playersRef.current.get(activePlayerId);
        previousPlayer?.stop();
      }

      activePlayerIdRef.current = playerId;
      setPendingAutoPlayKey(null);
      resetGlobalRetryCount();
      localStorage.setItem(
        PLAYBACK_STORAGE_KEY,
        JSON.stringify({ radioKey: playerId, isPlaying: true })
      );
    },
    [resetGlobalRetryCount]
  );

  const handlePlayerPause = useCallback((playerId) => {
    if (activePlayerIdRef.current !== playerId) return;

    localStorage.setItem(
      PLAYBACK_STORAGE_KEY,
      JSON.stringify({ radioKey: playerId, isPlaying: false })
    );
  }, []);

  useEffect(() => {
    const handleMouseDownAnywhere = () => {
      resetGlobalRetryCount();
    };

    window.addEventListener('mousedown', handleMouseDownAnywhere);

    return () => {
      window.removeEventListener('mousedown', handleMouseDownAnywhere);
    };
  }, [resetGlobalRetryCount]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);

        if (Array.isArray(parsed)) {
          setFavoriteKeys(parsed);
          setFavoritesLoaded(true);
          return;
        }
      } catch (error) {
        console.error('Error leyendo favoritos:', error);
      }
    }

    const availableKeys = new Set(
      radiosData.map((radio) => getRadioFavoriteKey(radio))
    );

    const defaultFavorites = DEFAULT_FAVORITE_KEYS.filter((key) =>
      availableKeys.has(key)
    );

    setFavoriteKeys(defaultFavorites);
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(defaultFavorites)
    );
    setFavoritesLoaded(true);
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const toggleFavorite = (radio) => {
    const radioKey = getRadioFavoriteKey(radio);

    setFavoriteKeys((prev) => {
      const updated = prev.includes(radioKey)
        ? prev.filter((key) => key !== radioKey)
        : [...prev, radioKey];

      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const sortedRadios = useMemo(() => {
    const filtered = radiosData.filter((radio) =>
      radio.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aFav = favoriteKeys.includes(getRadioFavoriteKey(a));
      const bFav = favoriteKeys.includes(getRadioFavoriteKey(b));

      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      const aCategoryPriority = CATEGORY_PRIORITY[a.category] ?? 999;
      const bCategoryPriority = CATEGORY_PRIORITY[b.category] ?? 999;

      if (aCategoryPriority !== bCategoryPriority) {
        return aCategoryPriority - bCategoryPriority;
      }

      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }, [searchTerm, favoriteKeys]);

  const totalPages = Math.ceil(sortedRadios.length / RADIOS_PER_PAGE);

  const paginatedRadios = useMemo(() => {
    const startIndex = (currentPage - 1) * RADIOS_PER_PAGE;
    return sortedRadios.slice(startIndex, startIndex + RADIOS_PER_PAGE);
  }, [sortedRadios, currentPage]);

  useEffect(() => {
    if (
      hasRestoredPageRef.current ||
      !favoritesLoaded ||
      !savedPlayback.isPlaying
    ) {
      return;
    }

    const savedRadioIndex = sortedRadios.findIndex(
      (radio) => getRadioFavoriteKey(radio) === savedPlayback.radioKey
    );

    if (savedRadioIndex >= 0) {
      setCurrentPage(Math.floor(savedRadioIndex / RADIOS_PER_PAGE) + 1);
    }

    hasRestoredPageRef.current = true;
  }, [favoritesLoaded, savedPlayback, sortedRadios]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMainStream = (radio) => {
    if (!radio.streams || radio.streams.length === 0) return null;
    return radio.streams[0];
  };

  const getVisiblePages = () => {
    if (totalPages <= 1) return [1];

    const pages = new Set([
      1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);

    const validPages = [...pages]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    const result = [];

    for (let i = 0; i < validPages.length; i++) {
      const current = validPages[i];
      const previous = validPages[i - 1];

      if (i > 0 && current - previous > 1) {
        result.push(`ellipsis-${current}`);
      }

      result.push(current);
    }

    return result;
  };

  return (
    <>
      <Navbar />

      <div className="radio-page">
        <div className="radio-page__topbar">
          <h1 className="radio-page__title">📻 Emisoras 📻</h1>

          <div className="radio-page__search-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar emisora..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  clearSearch();
                  searchInputRef.current?.blur();
                }
              }}
              className="radio-page__search"
            />

            {searchTerm && (
              <button
                type="button"
                className="radio-page__search-clear"
                onClick={() => {
                  clearSearch();
                  searchInputRef.current?.focus();
                }}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="radio-grid">
          {paginatedRadios.length > 0 ? (
            paginatedRadios.map((radio) => {
              const radioKey = getRadioFavoriteKey(radio);
              const isFavorite = favoriteKeys.includes(radioKey);
              const mainStream = getMainStream(radio);

              return (
                <div className="radio-card" key={radio.id}>
                  <button
                    type="button"
                    className={`radio-card__favorite ${
                      isFavorite ? 'active' : ''
                    }`}
                    onClick={() => toggleFavorite(radio)}
                    aria-label={
                      isFavorite
                        ? `Quitar ${radio.name} de favoritos`
                        : `Añadir ${radio.name} a favoritos`
                    }
                    title={
                      isFavorite
                        ? 'Quitar de favoritos'
                        : 'Añadir a favoritos'
                    }
                  >
                    ♥
                  </button>

                  <div className="radio-card__header">
                    <div className="radio-card__logo-wrapper">
                      <img
                        src={radio.logo}
                        alt={radio.name}
                        className="radio-card__logo"
                        loading="lazy"
                      />
                    </div>

                    <div className="radio-card__info">
                      <h2 className="radio-card__title">{radio.name}</h2>
                      <span className="radio-card__category">
                        {radio.region
                          ? `${radio.category} · ${radio.region}`
                          : radio.category}
                      </span>
                    </div>
                  </div>

                  {mainStream ? (
                    <RadioPlayer
                      playerId={radioKey}
                      streamUrl={mainStream.url}
                      onPlayerPlay={handlePlayerPlay}
                      onPlayerPause={handlePlayerPause}
                      shouldAutoPlay={
                        favoritesLoaded &&
                        pendingAutoPlayKey === radioKey
                      }
                      registerPlayer={registerPlayer}
                      consumeGlobalRetry={consumeGlobalRetry}
                    />
                  ) : (
                    <div className="radio-card__empty">Stream no disponible</div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="radio-page__no-results">
              No se encontraron emisoras.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="radio-pagination">
            <div className="radio-pagination__numbers">
              {getVisiblePages().map((item) => {
                if (typeof item === 'string') {
                  return (
                    <span key={item} className="radio-pagination__ellipsis">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={item}
                    className={`radio-pagination__number ${
                      currentPage === item ? 'active' : ''
                    }`}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Radio;