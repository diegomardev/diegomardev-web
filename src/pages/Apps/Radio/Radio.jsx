import React from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Radio.css';

function Radio() {
  const radios = [
    {
      id: 1,
      name: 'LOS40 Classic',
      logo: '/https://scontent.fmad8-1.fna.fbcdn.net/v/t39.30808-1/347800043_7017190358297662_1536262422819910188_n.png?stp=dst-png_s200x200&_nc_cat=109&ccb=1-7&_nc_sid=08baa4&_nc_ohc=dlAhzCH58ywQ7kNvwFU8Jbb&_nc_oc=AdmLcGhremH2deU1Er1J6FgJXJyqRh2abI34iqZGummCFcG08-aqgga1ZM-vxPMHzOs&_nc_zt=24&_nc_ht=scontent.fmad8-1.fna&edm=AKsJ254EAAAA&_nc_gid=wRtDyxhWUL2LNL37YtAY6w&oh=00_AfyWIi8SJIaRLPvpNyEGKEWrY9i3zvXaw_2jlO-zvUnAIA&oe=69B766EB',
      streamUrl:
        'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC_SC',
    },
    {
      id: 2,
      name: 'Rock FM',
      logo: '/https://scontent.fmad8-1.fna.fbcdn.net/v/t39.30808-1/347800043_7017190358297662_1536262422819910188_n.png?stp=dst-png_s200x200&_nc_cat=109&ccb=1-7&_nc_sid=08baa4&_nc_ohc=dlAhzCH58ywQ7kNvwFU8Jbb&_nc_oc=AdmLcGhremH2deU1Er1J6FgJXJyqRh2abI34iqZGummCFcG08-aqgga1ZM-vxPMHzOs&_nc_zt=24&_nc_ht=scontent.fmad8-1.fna&edm=AKsJ254EAAAA&_nc_gid=wRtDyxhWUL2LNL37YtAY6w&oh=00_AfyWIi8SJIaRLPvpNyEGKEWrY9i3zvXaw_2jlO-zvUnAIA&oe=69B766EB',
      streamUrl: 'https://rockfm-cope.flumotion.com/playlist.m3u8',
    },
    {
      id: 3,
      name: 'Europa FM',
      logo: '/logos/europafm.png',
      streamUrl: 'https://radio-atres-live.ondacero.es/api/livestream-redirect/EFMAAC.aac',
    },
    {
      id: 4,
      name: 'LOS40',
      logo: '/logos/los40.png',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_SC',
    },
    {
      id: 5,
      name: 'Cadena 100',
      logo: '/logos/cadena100.png',
      streamUrl: 'https://cadena100-cope.flumotion.com/playlist.m3u8',
    },
    {
      id: 6,
      name: 'Kiss FM',
      logo: '/logos/kissfm.png',
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
              <div className="radio-card__header">
                <div className="radio-card__logo-wrapper">
                  <img
                    src={radio.logo}
                    alt={radio.name}
                    className="radio-card__logo"
                  />
                </div>

                <h2 className="radio-card__title">{radio.name}</h2>
              </div>

              {radio.streamUrl ? (
                <audio controls preload="none" className="radio-card__audio">
                  <source src={radio.streamUrl} type="audio/mpeg" />
                  Tu navegador no soporta audio HTML5.
                </audio>
              ) : (
                <div className="radio-card__empty">Stream pendiente</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Radio;