import React, { useState, useEffect } from 'react';
import './Map.css';
import Navbar from '../../../components/Navbar/Navbar';
import { fromLatLon } from 'utm';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markermap from '../../../assets/images/marker-icon.png';
import markershadow from '../../../assets/images/marker-shadow.png';

let markerIcon = L.icon({
  iconUrl: markermap,
  shadowUrl: markershadow,
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  shadowAnchor: [12, 41],
});

// Componente para manejar los eventos de clic en el mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
}

function Maps() {
  const [latitude, setLatitude] = useState(52.517265);
  const [longitude, setLongitude] = useState(13.389244);
  const [puntos, setPuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState(0);
  const [zoom, setZoom] = useState(13);
  const [selecting, setSelecting] = useState(false);
  const [map, setMap] = useState(null); // Estado para guardar referencia al mapa

  useEffect(() => {
    if (map) {
      map.setView([latitude, longitude], zoom); // Actualizar la vista del mapa cuando cambie la ubicación
    }
  }, [latitude, longitude, zoom, map]);

  const handleMapClick = (event) => {
    if (!selecting) return;

    const nuevoPunto = { lat: event.latlng.lat, lon: event.latlng.lng };
    console.log('Nuevo Punto:', nuevoPunto); // Para depuración
    setPuntos([...puntos, nuevoPunto]);
  };

  const iniciarSeleccion = () => {
    setPuntos([]);
    setArea(0);
    setSelecting(true);
  };

  const finalizarSeleccion = () => {
    // Crear una variable temporal para los puntos con el punto inicial al final
    let puntosCerrados = [...puntos];
    if (puntos.length >= 2) {
      puntosCerrados.push(puntos[0]);
    }

    const calculatedArea = calcularArea(puntosCerrados);
    console.log('Área Calculada:', calculatedArea); // Para depuración
    setArea(calculatedArea);
    setPuntos(puntosCerrados); // Actualizar los puntos con el polígono cerrado
    setAreas([...areas, { puntos: puntosCerrados, area: calculatedArea }]);
    setSelecting(false);
  };

  const calcularArea = (puntos) => {
    if (puntos.length < 3) return 0;

    const puntosUTM = puntos.map((punto) => fromLatLon(punto.lat, punto.lon));
    let area = 0;
    const n = puntosUTM.length;
    for (let i = 0; i < n; i++) {
      const { easting: x1, northing: y1 } = puntosUTM[i];
      const { easting: x2, northing: y2 } = puntosUTM[(i + 1) % n];
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
  };

  const agregarPuntoDesdeGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nuevoPunto = { lat: latitude, lon: longitude };
          console.log('Nuevo Punto GPS:', nuevoPunto); // Para depuración
          setPuntos([...puntos, nuevoPunto]);
          setLatitude(latitude);
          setLongitude(longitude);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
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
        <div className="map">
          <MapContainer center={[latitude, longitude]} zoom={zoom} style={{ width: '80vw', height: '60vh', borderRadius: '20px' }} whenCreated={setMap}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />
            {puntos.map((punto, index) => (
              <Marker key={index} position={[punto.lat, punto.lon]} icon={markerIcon} />
            ))}
            {areas.map((areaObj, index) => (
              <Polyline key={index} positions={areaObj.puntos.map((punto) => [punto.lat, punto.lon])} />
            ))}
            {puntos.length > 1 && <Polyline positions={puntos.map((punto) => [punto.lat, punto.lon])} />}
          </MapContainer>
        </div>
        <div className="info">
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
          <p>Zoom: {zoom}</p>
          {puntos.map((punto, index) => (
            <p key={index}>
              Punto {index + 1}: {punto.lat}, {punto.lon}
            </p>
          ))}
          <p>Área actual: {area} metros cuadrados</p>
          <button onClick={iniciarSeleccion} disabled={selecting}>
            Iniciar Área
          </button>
          <button onClick={finalizarSeleccion} disabled={!selecting}>
            Finalizar Área
          </button>
          <button onClick={agregarPuntoDesdeGPS} disabled={!selecting}>
            Agregar Punto desde GPS
          </button>
          <button onClick={moveToCurrentLocation}>Mover a mi ubicación actual</button>
          <h2>Áreas calculadas:</h2>
          {areas.map((areaObj, index) => (
            <div key={index}>
              <p>Área {index + 1}: {areaObj.area} metros cuadrados</p>
              {areaObj.puntos.map((punto, pIndex) => (
                <p key={pIndex}>
                  Punto {pIndex + 1}: {punto.lat}, {punto.lon}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Maps;
