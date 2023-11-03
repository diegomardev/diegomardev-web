import { useState } from 'react';
import './Coordinate_Converter.css';
import Navbar from '../../../../components/Navbar/Navbar';

function Apps() {
  const [latitude, setLatitude] = useState(47.564028);
  const [longitude, setLongitude] = useState(10.762556);
  const [latitudeDegrees, setLatitudeDegrees] = useState(47);
  const [longitudeDegrees, setLongitudeDegrees] = useState(10);
  const [latitudeMinutes, setLatitudeMinutes] = useState(33);
  const [longitudeMinutes, setLongitudeMinutes] = useState(45);
  const [latitudeSeconds, setLatitudeSeconds] = useState(50.5008);
  const [longitudeSeconds, setLongitudeSeconds] = useState(45.2016);

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
    //console.log(value);
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
                name="latitude"
                autoComplete="off"
                className="input-calculator"
                value={latitude}
                onChange={(e) => handleLatitudeChange(e)}
              />
              <label className="user-label-calculator">Latitude</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="longitude"
                autoComplete="off"
                className="input-calculator input-calculator"
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
                name="latDegrees"
                autoComplete="off"
                className="input-calculator degrees"
                value={latitudeDegrees}
                onChange={(e) => handleDMSChange('latDegrees', e)}
              />
              <label className="user-label-calculator">Lat º</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="latMinutes"
                autoComplete="off"
                className="input-calculator minutes"
                value={latitudeMinutes}
                onChange={(e) => handleDMSChange('latMinutes', e)}
              />
              <label className="user-label-calculator">Lat '</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="latSeconds"
                autoComplete="off"
                className="input-calculator seconds"
                value={latitudeSeconds}
                onChange={(e) => handleDMSChange('latSeconds', e)}
              />
              <label className="user-label-calculator">Lat "</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="lonDegrees"
                autoComplete="off"
                className="input-calculator degrees"
                value={longitudeDegrees}
                onChange={(e) => handleDMSChange('lonDegrees', e)}
              />
              <label className="user-label-calculator">Lon º</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="lonMinutes"
                autoComplete="off"
                className="input-calculator minutes"
                value={longitudeMinutes}
                onChange={(e) => handleDMSChange('lonMinutes', e)}
              />
              <label className="user-label-calculator">Lon '</label>
            </div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                name="lonSeconds"
                autoComplete="off"
                className="input-calculator seconds"
                value={longitudeSeconds}
                onChange={(e) => handleDMSChange('lonSeconds', e)}
              />
              <label className="user-label-calculator">Lon "</label>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Apps;
