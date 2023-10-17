import React, { useState, useEffect } from 'react';
import '../../../index.css';
import './Sensor_Data.css';
import Navbar from '../../../components/Navbar/Navbar';

function Sensor_data() {
  const [accelerationData, setAccelerationData] = useState({
    x: 0,
    y: 0,
    z: 0
  });

  const [gyroscopeData, setGyroscopeData] = useState({
    x: 0,
    y: 0,
    z: 0
  });

  const [orientationData, setOrientationData] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0
  });

  const [compassData, setCompassData] = useState(0);

  useEffect(() => {
    if ('LinearAccelerationSensor' in window) {
      const accelerometer = new LinearAccelerationSensor();
      accelerometer.addEventListener('reading', () => {
        setAccelerationData({
          x: accelerometer.x.toFixed(2),
          y: accelerometer.y.toFixed(2),
          z: accelerometer.z.toFixed(2)
        });
      });
      accelerometer.start();
    } else {
      console.log('El acelerómetro no es compatible con este dispositivo o navegador.');
    }

    if ('Gyroscope' in window) {
      const gyroscope = new Gyroscope();
      gyroscope.addEventListener('reading', () => {
        setGyroscopeData({
          x: gyroscope.x.toFixed(2),
          y: gyroscope.y.toFixed(2),
          z: gyroscope.z.toFixed(2)
        });
      });
      gyroscope.start();
    } else {
      console.log('El giroscopio no es compatible con este dispositivo o navegador.');
    }

    if ('DeviceOrientationEvent' in window) {
      const handleOrientationChange = (event) => {
        setOrientationData({
          alpha: event.alpha.toFixed(2),
          beta: event.beta.toFixed(2),
          gamma: event.gamma.toFixed(2)
        });

        if (event.webkitCompassHeading) {
          setCompassData((event.webkitCompassHeading.toFixed(2)));
        } else if (event.alpha) {
          setCompassData((event.alpha.toFixed(2)));
        } else {
          setCompassData(0);
        }
      };
      window.addEventListener('deviceorientation', handleOrientationChange);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientationChange);
      };
    } else {
      console.log('La API de DeviceOrientationEvent no es compatible con este dispositivo o navegador.');
    }
  }, []);
  const Compass = ({ heading }) => {
    return (
      <div className="compass">
        <div className="compass-circle">
          <div className="compass-arrow" style={{ transform: `rotate(${heading}deg)` }}></div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Mobile Sensor</h1>
      <div>
      <h2>Inclinación</h2>
      <p>Alpha: {orientationData.alpha}</p>
      <p>Beta: {orientationData.beta}</p>
      <p>Gamma: {orientationData.gamma}</p>

      <h2>Brújula</h2>
      <p>Grados: {compassData+90}º</p>
      <Compass heading={compassData+90} />

      <h2>Acelerómetro</h2>
      <p>Valor X: {accelerationData.x}</p>
      <p>Valor Y: {accelerationData.y}</p>
      <p>Valor Z: {accelerationData.z}</p>

      <h2>Giroscopio</h2>
      <p>Velocidad X: {gyroscopeData.x}</p>
      <p>Velocidad Y: {gyroscopeData.y}</p>
      <p>Velocidad Z: {gyroscopeData.z}</p>

    </div>
    </>
  );
}

export default Sensor_data;
