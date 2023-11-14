import { useState, useEffect } from 'react';
import './Coordinate_Converter.css';
import Navbar from '../../../../components/Navbar/Navbar';
import gk from 'gauss-krueger';
import { fromLatLon, toLatLon } from "utm-projection";
import Map from '../../../../components/Map/Map'

function Apps() {
  // Variables para coordenadas decimales
  const [latitude, setLatitude] = useState(52.517265);
  const [longitude, setLongitude] = useState(13.389244);
  const [altitude, setAltitude] = useState(100000.0);

  // Variables para coordenadas en grados, minutos y segundos
  const [latitudeDegrees, setLatitudeDegrees] = useState(52);
  const [longitudeDegrees, setLongitudeDegrees] = useState(13);
  const [latitudeMinutes, setLatitudeMinutes] = useState(31);
  const [longitudeMinutes, setLongitudeMinutes] = useState(23);
  const [latitudeSeconds, setLatitudeSeconds] = useState(2.154);
  const [longitudeSeconds, setLongitudeSeconds] = useState(21.2784);

  // Variables para coordenadas Gauß-Krüger
  const [zone, setZone] = useState(4);
  const [r, setR] = useState(4594410.412);
  const [h, setH] = useState(5821363.617);

  // Variables para coordenadas UTM
  const [easting, setEasting] = useState(395733.419);
  const [northing, setNorthing] = useState(6042268.877);
  const [zoneNum, setZoneNum] = useState(33);
  const [zoneLetter, setZoneLetter] = useState('U');

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

  const handleMapClick = (position) => {
    setLatitude(position[0]);
    setLongitude(position[1]);
  };

  const handleLatitudeChange = (e) => {
    let value = e.target.value;
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
      DecimaltoGaussKreuger(newLat, newLon);
      setLatitudeDegrees(newLatDegrees);
      setLatitudeMinutes(newLatMinutes);
      setLatitudeSeconds(newLatSeconds);
      setLongitudeDegrees(newLonDegrees);
      setLongitudeMinutes(newLonMinutes);
      setLongitudeSeconds(newLonSeconds);
    }
  };
  const handleZoneChange = (e) => {
  }
  const handleRChange = (e) => {
    let value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setR(value);
      GaussKreugertoDecimal(value, h);
    }
  };
  
  const handleHChange = (e) => {
    let value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setH(value);
      GaussKreugertoDecimal(r, value);
    }
  };
  
  const GaussKreugertoDecimal = (r, h) => {
    r = r*1;
    h = h*1;
    let wgs84 = gk.toWGS({x: r, y: h});
    setLatitude(wgs84.latitude);
    setLongitude(wgs84.longitude);
  };
  const DecimaltoGaussKreuger = (lon, lat) => {
    lat = lat*1; //multiplicamos *1 para que pasen de string a number
    lon = lon*1; //multiplicamos *1 para que pasen de string a number
    try{
      let gk2 = gk.toGK({longitude: lon, latitude: lat})
      //console.log(gk2)
      setR(gk2.x.toFixed(3));
      setH(gk2.y.toFixed(3));
      let zona = parseInt(gk2.x.toString()[0]);
      setZone(zona);
    }
    catch(e){
      setR(0);
      setH(0);
      setZone(0);
    }
  };
  
  const handleEastingChange = (e) => {
    let value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setEasting(value);
      UTMtoDecimal(value, northing, zoneNum);
    }
  };
  const handleNorthingChange = (e) => {
    let value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setEasting(value);
      UTMtoDecimal(easting, value, zoneNum);
    }
  };
  const handleZoneNumChange = (e) => {
    let value = parseFloat(e.target.value);
    console.log(value);
    if (!isNaN(value)) {
      setEasting(value);
      UTMtoDecimal(easting, northing, value);
    }
  };
  const DecimaltoUTM = () => {
    let lat =latitude*1;
    let lon = longitude*1;
    if(lat > 84){lat = 84;}
    if(lat < -84){lat = -84;}
    if(lon > 180){lon = 180;}
    if(lon < -180){lon = -180;}
    const res = fromLatLon(lat, lon);
    setEasting(res.easting.toFixed(3));
    setNorthing(res.northing.toFixed(3));
    setZoneNum(res.zoneNum);
    setZoneLetter(res.zoneLetter);
  };
  const UTMtoDecimal = (eas,nor,zon) => {
    const res = toLatLon(eas, nor, zon);
    setLatitude(res.latitude);
    setLongitude(res.longitude);
  };
  useEffect(() => {
    document.title = `Coordinate Converter`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Coordinate Converter`);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', `coordinate, conventer, latitude, longitude, gauss ,kruger, UTM, WGS84`);
    }
  }, []);
  useEffect(()=>{
    DecimaltoGaussKreuger(longitude, latitude);
    DecimaltoUTM();
    updateDMSFromDecimal(latitude, longitude);
  },[latitude, longitude])

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
                min="-80"
                max="84"
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
                min="-180"
                max="180"
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
          <span>Degrees Minutes Seconds</span>
          <div>
            <div className="input-group-calculator">
              <input
                required
                type="number"
                min="-80"
                max="84"
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
                min="-180"
                max="180"
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
          <span>UTM (WGS84)</span>
          <div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="string"
                step="any"
                name="zoneNum"
                autoComplete="off"
                className="input-calculator-coordinate zone"
                value={zoneNum+zoneLetter}
                onChange={(e) => handleZoneNumChange(e)}
              />
              <label className="user-label-calculator user-label-zone">Zone</label>
            </div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="number"
                step="any"
                name="easting"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={easting}
                onChange={(e) => handleEastingChange(e)}
              />
              <label className="user-label-calculator">Easting (E)</label>
            </div>
            <div className="input-group-calculator input-group-calculator-gaus">
              <input
                required
                type="number"
                step="any"
                name="northing"
                autoComplete="off"
                className="input-calculator-coordinate seconds"
                value={northing}
                onChange={(e) => handleNorthingChange(e)}
              />
              <label className="user-label-calculator">Northing (N)</label>
            </div>
          </div>
          <span>Gauß-Krüger (only zones: 2,3,4,5)</span>
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
                onChange={(e) => handleDMSChange('lonSeconds', e)}
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
              <label className="user-label-calculator">Rechtswert (E)</label>
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
              <label className="user-label-calculator">Hochwert (N)</label>
            </div>
          </div>
        </form>
        <div className='map'>
          <Map Latitude={latitude} Longitude={longitude} size_width="360px" size_height="360px" border_radius="20px" onMapClick={handleMapClick}></Map>
        </div>
      </div>
    </>
  );
}

export default Apps;
