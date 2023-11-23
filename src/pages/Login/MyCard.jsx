import React, { useRef, useEffect, useState } from 'react';
import Atropos from 'atropos/react';
import "atropos/atropos.css";
import "./Login.css";
import diegomar from '../../assets/users/diegomar.jpg';
import atroposbg from './atropos-bg.svg';
import logo from '/src/assets/images/rocket.svg';
import rocket from '../../assets/images/rocket.svg';

const BackgroundPattern = () => (
	<svg id='patternId' width='100%' height='120%' xmlns='http://www.w3.org/2000/svg' className="atropos-banner-spacer" style={{ marginTop: '-70%' }}>
		<defs>
			<pattern id='a' patternUnits='userSpaceOnUse' width='180' height='45'>
				<path
					d='m0 5.625 14.06 7.03 16.876-8.438L22.502 0H11.25l8.436 4.219-5.623 2.81L0 0ZM33.75 0l2.81 1.406L39.374 0Zm16.871 0h.002L19.686 15.469l16.877 8.44 30.939-15.47 5.625 2.811-30.94 15.47 16.875 8.438 14.063-7.031 5.623 2.812L50.621 45h11.25l28.131-14.063L73.126 22.5l-14.065 7.033-5.623-2.812L84.374 11.25 67.498 2.81 36.561 18.282l-5.625-2.814L61.87 0H50.62Zm22.505 0L90 8.437l14.06-7.03 5.626 2.812-30.938 15.469 16.874 8.438 30.939-15.472 5.625 2.815L73.126 45h11.25l59.061-29.532L126.56 7.03 95.622 22.499l-5.621-2.814 30.934-15.467L112.498 0H95.621l-5.623 2.813L84.376 0Zm50.624 0h-.002l44.998 22.5-5.623 2.813-14.063-7.032-16.876 8.44 30.941 15.468-2.813 1.407L157.499 45h11.249l5.628-2.813-30.938-15.468 5.624-2.813 14.064 7.033L180 22.501 134.998 0Zm33.749 45L126.56 29.532l-16.877 8.439L123.749 45h11.249l-14.062-7.03 5.625-2.812L146.248 45ZM146.248 0l11.25 5.625L168.748 0Zm16.875 8.44L180 16.877V11.25l-5.625-2.815L180 5.625V0ZM0 11.25v5.627l42.186 21.092-5.625 2.814-30.938-15.47L0 28.122v5.629l5.623-2.813L33.75 45h5.624l14.062-7.031zm0 22.502v5.625L11.251 45h11.251zm180-5.631v.002l-11.252 5.627L180 39.377Zm-75.939 12.662L95.621 45h16.877z'
					strokeWidth='1'
					stroke='none'
					fill='rgba(255, 255, 255, .1)'
				/>
			</pattern>
		</defs>
		<rect width='800%' height='800%' transform='translate(0,0)' fill='url(#a)' />
	</svg>
)

const MyImage = ({ name, lastname, image, id, imageSize}) => {
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
      <Atropos className="atropos-banner" highlight={true} shadowScale={0.5}>
        <img
          className="atropos-banner-spacer"
          src={atroposbg}
          alt=""
        />
        <img
          ref={imageRef}
          src={rocket}
          alt=""
          style={{
            width: '40%',
            height: 'auto',
            top: 'auto',
            bottom: '5%',
            right: '5%',
            left: 'auto',
            zIndex: '1',
            opacity: '0.4',
          }}
        />
        <BackgroundPattern/>
        <img
          data-atropos-offset="0"
          src="https://raw.githubusercontent.com/nolimits4web/atropos/master/playground/react/i/atropos-bg.svg"
          alt=""
          style={{zIndex: '-1'}}
        />
        <img
          ref={imageRef}
          src={image}
          alt=""
          //onLoad={handleImageLoad} // Call the handleImageLoad when the image is loaded
          className='img-overlay img-overlay img-overlay'
        />
        <div className="text-name-lastname">
          <span>{name} {lastname}</span>
        </div>
        <div className="text-id">
          <span>#{id}</span>
        </div>
      </Atropos>
    </div>
  );
}

export default MyImage;
