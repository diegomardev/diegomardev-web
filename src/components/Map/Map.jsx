/////Para llamar a este componente se haría de la siguiente forma:
// <Map Latitude={latitude} Longitude={longitude} size_width="360px" size_height="360px" border_radius="20px" onMapClick={handleMapClick}></Map>
//Para manejar la posición del mapa cuando se hace clic se debe pasar la función handleMapClick como propiedad.
/*  
  const handleMapClick = (position) => {
    setLatitude(position[0]);
    setLongitude(position[1]);
  };
*/
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markermap from     '../../assets/images/marker-icon.png';
import markershadow from  '../../assets/images/marker-shadow.png';


function ClickHandler({ setMarkerPosition, onMapClick }) {
  
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      // Llama a la función proporcionada por el componente principal solo si está definida
      const zoom = map.getZoom();
      onMapClick && onMapClick([lat, lng, zoom]);
    },
  });
  return null;
}
function Map({ size_width, size_height, Latitude, Longitude, zoom, onMapClick}) {
  const [markerPosition, setMarkerPosition] = useState([Latitude, Longitude]);
  // Función para manejar la posición del mapa cuando se hace clic
  const handleMapClick = (position) => {
    onMapClick && onMapClick(position)
  };

  let markerIcon = L.icon({
    iconUrl: markermap,
    shadowUrl: markershadow,
    iconSize: [25, 41],
    shadowSize: [41, 41],
    iconAnchor: [12, 41],
    shadowAnchor: [12, 41],
  });

  const mapContainerStyle = {
    width: size_width,
    height: size_height,
    borderRadius: '20px',
    position: 'relative'
  };

  return (
    <div>
      <MapContainer
        attributionControl={false}
        center={markerPosition}
        zoom={zoom}
        style={{ ...mapContainerStyle}}
        className="leaflet-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={markerPosition} icon={markerIcon}>
          <Popup>Your point is here</Popup>
        </Marker>
        {/* Pasa la función de manejo del clic al componente ClickHandler */}
        <ClickHandler setMarkerPosition={setMarkerPosition} onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}

export default Map;
