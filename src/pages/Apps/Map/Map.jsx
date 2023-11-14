import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';


function ClickHandler({ setMarkerPosition }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);  // Actualiza la posición del marcador
    },
  });

  return null;
}

function App() {
  const [markerPosition, setMarkerPosition] = useState([43.3607804, -8.41120]);

  return (
    <div>
      <MapContainer
        attributionControl={false}
        center={markerPosition}
        zoom={13}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerPosition} >
          <Popup>Your point is here</Popup>
          <img
            src="./../marker-icon.png"
            alt="Custom Marker"
            style={{marginLeft: '-12px' , marginTop: '-41px' , width: '25px', height: '41px' ,zIndex: '1000'}}
          />          
        </Marker>
        <ClickHandler setMarkerPosition={setMarkerPosition} />
      </MapContainer>
    </div>
  );
}

export default App;
