import { useState } from 'react';
import './Coordinate_Converter.css';
import Navbar from '../../../../components/Navbar/Navbar';

function Apps() {
  // Variables para coordenadas decimales
  const [latitude, setLatitude] = useState(52.517265);
  const [longitude, setLongitude] = useState(13.389244);

  // Variables para coordenadas en grados, minutos y segundos
  const [latitudeDegrees, setLatitudeDegrees] = useState(52);
  const [longitudeDegrees, setLongitudeDegrees] = useState(13);
  const [latitudeMinutes, setLatitudeMinutes] = useState(31);
  const [longitudeMinutes, setLongitudeMinutes] = useState(23);
  const [latitudeSeconds, setLatitudeSeconds] = useState(2.154);
  const [longitudeSeconds, setLongitudeSeconds] = useState(21.2784);

  // Variables para coordenadas Gauß-Krüger
  const [zone, setZone] = useState(4); // Ejemplo, debes establecer la zona correcta
  const [r, setR] = useState(4594410.412);
  const [h, setH] = useState(5821363.617);

  const updateDecimalDegrees = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  const updateDMSFromDecimal = (lat, lon) => {
    const latDegree = Math.floor(lat);
    const latMinute = Math.floor((lat - latDegree) * 60);
    const latSecond = ((lat - latDegree) * 60 - latMinute) * 60;

    const lonDegree = Math.floor(lon);
    const lonMinute = Math.floor((lon - lonDegree) * 60);
    const lonSecond = ((lon - lonDegree) * 60 - lonMinute) * 60;

    setLatitudeDegrees(latDegree);
    setLatitudeMinutes(latMinute);
    setLatitudeSeconds(latSecond);
    setLongitudeDegrees(lonDegree);
    setLongitudeMinutes(lonMinute);
    setLongitudeSeconds(lonSecond);
  };

  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      updateDecimalDegrees(value, longitude);
      updateDMSFromDecimal(value, longitude);
    }
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      updateDecimalDegrees(latitude, value);
      updateDMSFromDecimal(latitude, value);
    }
  };

  const handleDMSChange = (type, e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      let newLatDegrees = latitudeDegrees;
      let newLonDegrees = longitudeDegrees;
      let newLatMinutes = latitudeMinutes;
      let newLonMinutes = longitudeMinutes;
      let newLatSeconds = latitudeSeconds;
      let newLonSeconds = longitudeSeconds;

      if (type === 'latDegrees') {
        newLatDegrees = value;
      } else if (type === 'latMinutes') {
        newLatMinutes = value;
      } else if (type === 'latSeconds') {
        newLatSeconds = value;
      } else if (type === 'lonDegrees') {
        newLonDegrees = value;
      } else if (type === 'lonMinutes') {
        newLonMinutes = value;
      } else if (type === 'lonSeconds') {
        newLonSeconds = value;
      }

      const newLat = newLatDegrees + newLatMinutes / 60 + newLatSeconds / 3600;
      const newLon = newLonDegrees + newLonMinutes / 60 + newLonSeconds / 3600;

      setLatitude(newLat);
      setLongitude(newLon);
      setLatitudeDegrees(newLatDegrees);
      setLatitudeMinutes(newLatMinutes);
      setLatitudeSeconds(newLatSeconds);
      setLongitudeDegrees(newLonDegrees);
      setLongitudeMinutes(newLonMinutes);
      setLongitudeSeconds(newLonSeconds);
    }
  };
  const handleZoneChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setZone(value);
      updateDecimalFromGaussKreuger(value, r, h);
    }
  };
  
  const handleRChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setR(value);
      updateDecimalFromGaussKreuger(zone, value, h);
    }
  };
  
  const handleHChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setH(value);
      updateDecimalFromGaussKreuger(zone, r, value);
    }
  };
  
  const updateDecimalFromGaussKreuger = (zone, r, h) => {
    const rho = 57.29577951; // 180/PI
    const e2 = 0.006719219;
    const b1 = r / 10000855.7646;
    const b2 = b1 * b1;
    const bf = (325632.08677 * b1 * (
      ((((0.00000562025 * b2 - 0.0000436398) * b2 + 0.00022976983) * b2 - 0.00113566119) * b2 + 0.00424914906) * b2 - 0.00831729565) * b2 + 1) / 3600 / rho;
    const fa = (zone * 1000000 - 500000) / (6398786.849 / Math.sqrt(1 + Math.pow(Math.cos(bf), 2) * e2));
    const LAT_Formula = (bf - (Math.pow(fa, 2) * (Math.sin(bf) / Math.cos(bf)) * (1 + Math.pow(Math.cos(bf), 2) * e2) / 2) + (Math.pow(fa, 4) * (Math.sin(bf) / Math.cos(bf)) * (5 + 3 * Math.pow(Math.sin(bf) / Math.cos(bf), 2) + 6 * Math.pow(Math.cos(bf), 2) * e2 - 6 * Math.pow(Math.cos(bf), 2) * e2 * Math.pow(Math.sin(bf) / Math.cos(bf), 2)) / 24)) * rho;
    const LON_Formula = (fa - (Math.pow(fa, 3) * (1 + 2 * Math.pow(Math.sin(bf) / Math.cos(bf), 2) + Math.pow(Math.cos(bf), 2) * e2) / 6 + (Math.pow(fa, 5) * (1 + 28 * Math.pow(Math.sin(bf) / Math.cos(bf), 2) + 24 * Math.pow(Math.sin(bf) / Math.cos(bf), 4)) / 120)) * rho / Math.cos(bf));
  
    // Actualiza las coordenadas decimales
    setLatitude(LAT_Formula);
    setLongitude(LON_Formula);
    updateDMSFromDecimal(LAT_Formula, LON_Formula);
  };
  
  

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs aspect-ratio-tittle">Coordinate Converter</h1>
      <div>
        <form>
          <span>Decimal Degrees</span>
          <div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="latitude"
                autoComplete="off"
                className="input-calculator-coordinate"
                value={latitude}
                onChange={(e) => handleLatitudeChange(e)}
              />
              <label className="user-label-calculator">Latitude</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="longitude"
                autoComplete="off"
                className="input-calculator-coordinate"
                value={longitude}
                onChange={(e) => handleLongitudeChange(e)}
              />
              <label className="user-label-calculator">Longitude</label>
            </div>
          </div>
          <span>Degrees Minutes</span>
          <div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="latDegrees"
                autoComplete="off"
                className="input-calculator-coordinate degrees"
                value={latitudeDegrees}
                onChange={(e) => handleDMSChange('latDegrees', e)}
              />
              <label className="user-label-calculator">Lat º</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="latMinutes"
                autoComplete="off"
                className="input-calculator-coordinate minutes"
                value={latitudeMinutes}
                onChange={(e) => handleDMSChange('latMinutes', e)}
              />
              <label className="user-label-calculator">Lat '</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="latSeconds"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={latitudeSeconds}
                onChange={(e) => handleDMSChange('latSeconds', e)}
              />
              <label className="user-label-calculator">Lat "</label>
              </div>
            </div>
            <div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="lonDegrees"
                autoComplete="off"
                className="input-calculator-coordinate degrees"
                value={longitudeDegrees}
                onChange={(e) => handleDMSChange('lonDegrees', e)}
              />
              <label className="user-label-calculator">Lon º</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="lonMinutes"
                autoComplete="off"
                className="input-calculator-coordinate minutes"
                value={longitudeMinutes}
                onChange={(e) => handleDMSChange('lonMinutes', e)}
              />
              <label className="user-label-calculator">Lon '</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                step="any"
                name="lonSeconds"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={longitudeSeconds}
                onChange={(e) => handleDMSChange('lonSeconds', e)}
              />
              <label className="user-label-calculator">Lon "</label>
            </div>
          </div>
          <span>Gauß-Krüger</span>
          <div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="number"
                step="any"
                name="zone"
                autoComplete="off"
                className="input-calculator-coordinate zone"
                value={zone}
                onChange={(e) => handleZoneChange(e)}
              />
              <label className="user-label-calculator user-label-zone">Zone</label>
            </div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="number"
                step="any"
                name="r"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={r}
                onChange={(e) => handleRChange(e)}
              />
              <label className="user-label-calculator">Rechtswert (N)</label>
            </div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="number"
                step="any"
                name="h"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={h}
                onChange={(e) => handleHChange(e)}
              />
              <label className="user-label-calculator">Hochwert (E)</label>
            </div>
          </div>
        </form>
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000.0!2d${longitude}!3d${latitude}!!!!!!!!!!!!!`}
          width="360"
          height="360"
          className='map'
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps"
        />
      </div>
    </>
  );
}

export default Apps;
