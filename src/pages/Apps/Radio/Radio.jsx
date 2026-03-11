import React, { useRef, useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Los40Classic.css';

function Los40Classic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sustituye esta URL por la URL REAL del stream si la tienes autorizada
  const streamUrl = '';

  const handlePlay = async () => {
    if (!streamUrl) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error al reproducir el audio:', error);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const openOfficialSite = () => {
    window.open('https://los40.com/los40_classic/', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div>
        <Navbar />
      </div>

      <h1 className="read-the-docs">LOS40 Classic</h1>

      <div className="radio-player">
        <div className="radio-player__card">
          <h2 className="radio-player__title">Escucha LOS40 Classic</h2>
          <p className="radio-player__text">
            Reproduce la emisora desde tu web o abre el reproductor oficial.
          </p>

          {streamUrl ? (
            <>
              <audio
                ref={audioRef}
                src={streamUrl}
                onEnded={() => setIsPlaying(false)}
                controls
                className="radio-player__audio"
              >
                Tu navegador no soporta el elemento de audio.
              </audio>

              <div className="radio-player__buttons">
                <button className="button_normal" onClick={handlePlay}>
                  Play
                </button>
                <button className="button_normal" onClick={handlePause}>
                  Pause
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="radio-player__warning">
                No has configurado una URL de streaming. De momento puedes usar el acceso directo a la web oficial.
              </p>

              <div className="radio-player__buttons">
                <button className="button_normal" onClick={openOfficialSite}>
                  Abrir LOS40 Classic
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="read-the-docs">
        Música clásica del pop y acceso rápido a la emisora.
      </p>
    </>
  );
}

export default Los40Classic;