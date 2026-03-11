import React from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Radio.css';

function Radio() {
  const radios = [
    {
      id: 1,
      name: 'LOS40 Classic',
      streamUrl:
        'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC_SC',
    },
    {
      id: 2,
      name: 'Rock FM',
      streamUrl: 'https://rockfm-cope.flumotion.com/playlist.m3u8',
    },
    {
      id: 3,
      name: 'Europa FM',
      streamUrl: 'https://radio-atres-live.ondacero.es/api/livestream-redirect/EFMAAC.aac',
    },
    {
      id: 4,
      name: 'LOS40',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_SC',
    },
    {
      id: 5,
      name: 'Cadena 100',
      streamUrl: 'https://cadena100-cope.flumotion.com/playlist.m3u8',
    },
    {
      id: 6,
      name: 'Kiss FM',
      streamUrl: 'https://kissfm.kissfmradio.cires21.com/kissfm.mp3',
    },
  ];

  return (
    <>
      <Navbar />

      <div className="radio-page">
        <h1 className="radio-page__title">Radios Online</h1>

        <div className="radio-grid">
          {radios.map((radio) => (
            <div className="radio-card" key={radio.id}>
              <h2 className="radio-card__title">{radio.name}</h2>

              {radio.streamUrl ? (
                <audio controls preload="none" className="radio-card__audio">
                  <source src={radio.streamUrl} type="audio/mpeg" />
                  Tu navegador no soporta audio HTML5.
                </audio>
              ) : (
                <div className="radio-card__empty">
                  Stream pendiente
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Radio;