import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import radiosData from '../../../assets/radios/radios.json';
import './Radio.css';

const RADIOS_PER_PAGE = 9;
const FAVORITES_STORAGE_KEY = 'favorite_radios';

const CATEGORY_PRIORITY = {
  Musicales: 1,
  Nacionales: 2,
  'Autonómicas': 3,
  Deportivas: 4,
  Infantiles: 5,
  General: 6,
};

function Radio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);

        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed);
          return;
        }
      } catch (error) {
        console.error('Error leyendo favoritos:', error);
      }
    }

    const defaultFavoriteIds = radiosData
      .filter((radio) => radio.favoriteDefault)
      .map((radio) => radio.id);

    setFavoriteIds(defaultFavoriteIds);
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(defaultFavoriteIds)
    );
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const toggleFavorite = (radioId) => {
    setFavoriteIds((prev) => {
      const updated = prev.includes(radioId)
        ? prev.filter((id) => id !== radioId)
        : [...prev, radioId];

      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const sortedRadios = useMemo(() => {
    const filtered = radiosData.filter((radio) =>
      radio.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);

      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      const aCategoryPriority = CATEGORY_PRIORITY[a.category] ?? 999;
      const bCategoryPriority = CATEGORY_PRIORITY[b.category] ?? 999;

      if (aCategoryPriority !== bCategoryPriority) {
        return aCategoryPriority - bCategoryPriority;
      }

      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }, [searchTerm, favoriteIds]);

  const totalPages = Math.ceil(sortedRadios.length / RADIOS_PER_PAGE);

  const paginatedRadios = useMemo(() => {
    const startIndex = (currentPage - 1) * RADIOS_PER_PAGE;
    return sortedRadios.slice(startIndex, startIndex + RADIOS_PER_PAGE);
  }, [sortedRadios, currentPage]);

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
              const isFavorite = favoriteIds.includes(radio.id);
              const mainStream = getMainStream(radio);

              return (
                <div className="radio-card" key={radio.id}>
                  <button
                    type="button"
                    className={`radio-card__favorite ${
                      isFavorite ? 'active' : ''
                    }`}
                    onClick={() => toggleFavorite(radio.id)}
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
                        {radio.category}
                      </span>
                    </div>
                  </div>

                  {mainStream ? (
                    <audio controls preload="none" className="radio-card__audio">
                      <source src={mainStream.url} />
                      Tu navegador no soporta audio HTML5.
                    </audio>
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
            <button
              type="button"
              className="radio-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

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

            <button
              type="button"
              className="radio-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Radio;