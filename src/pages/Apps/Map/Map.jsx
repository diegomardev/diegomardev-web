import { useState } from 'react';
import './Map.css';
import Navbar from '../../../components/Navbar/Navbar';
import Map from '../../../components/Map/Map';

function Apps() {
  const [latitude, setLatitude] = useState(52.517265);
  const [longitude, setLongitude] = useState(13.389244);
  const [zoom, setZoom] = useState(13);
  const [mapKey, setMapKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner

  const handleMapClick = (position) => {
    setLatitude(position[0].toFixed(6));
    setLongitude(position[1].toFixed(6));
  };

  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true); // Mostrar spinner
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude.toFixed(6));
          setLongitude(longitude.toFixed(6));
          setMapKey((prevKey) => prevKey + 1);
          setIsLoading(false); // Ocultar spinner
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setIsLoading(false); // Ocultar spinner en caso de error
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Open Map</h1>
      <div>
        <div className='map'>
          <Map key={mapKey} Latitude={latitude} Longitude={longitude} size_width="80vw" size_height="60vh" border_radius="20px" zoom={zoom} onMapClick={handleMapClick}></Map>
        </div>
        <div className='info'>
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
          <button onClick={moveToCurrentLocation} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Mover a mi ubicación actual'}
          </button>
          {isLoading && <div className="spinner"></div>}
        </div>
      </div>
    </>
  );
}

export default Apps;
