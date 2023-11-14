import { useState, useEffect } from 'react';
import './Map.css';
import Navbar from '../../../components/Navbar/Navbar';
import gk from 'gauss-krueger';
import { fromLatLon, toLatLon } from "utm-projection";
import Map from '../../../components/Map/Map'

function Apps() {
  const [latitude, setLatitude] = useState(52.517265);
  const [longitude, setLongitude] = useState(13.389244);
  const handleMapClick = (position) => {
    setLatitude(position[0].toFixed(6));
    setLongitude(position[1].toFixed(6));
  };
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Open Map</h1>
      <div>
        <div className='map'>
          <Map Latitude={latitude} Longitude={longitude} size_width="360px" size_height="360px" border_radius="20px" onMapClick={handleMapClick}></Map>
        </div>
        <div className='info'>
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
        </div>
      </div>
    </>
  );
}

export default Apps;
