import React, { useRef, useEffect, useState } from 'react';
import Atropos from 'atropos/react';
import "atropos/atropos.css";
import "./Login.css";
import diegomar from '../../assets/users/diegomar.jpg';
import atroposbg from './atropos-bg.svg';

const MyImage = () => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const [renderedImageSize, setRenderedImageSize] = useState({ width: 0, height: 0 });
  let cardWidth = 0;

  const handleImageLoad = () => {
    if (cardRef.current) {
      cardWidth = cardRef.current.offsetWidth;
    }

    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setRenderedImageSize({ width, height });
    }
  };

  const imageWidth = cardWidth * 0.2; // 20% of the card width


  return (
    <div className="container" ref={cardRef}>
      <Atropos
        className="atropos-banner"
        highlight={false}
      >
      <img
        className="atropos-banner-spacer"
        src={atroposbg}
        alt=""
      />
      <img
        data-atropos-offset="0"
        src="https://raw.githubusercontent.com/nolimits4web/atropos/master/playground/react/i/atropos-bg.svg"
        alt=""
        style={{
          zIndex: '-1',
        }}
      />
        <img
          ref={imageRef}
          src={diegomar}
          alt=""
          onLoad={handleImageLoad} // Call the handleImageLoad when the image is loaded
          className='img-overlay'
          style={{
            width: '20%',
            height: 'auto',
            top: '10%',
            left: '40%',
          }}
        />
            <div className="text-overlay centered-text">
              <h2>Diego Martínez</h2>
            </div>
      </Atropos>
    </div>
  );
}

export default MyImage;
