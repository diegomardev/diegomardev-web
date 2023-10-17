import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Chronometer.css';

function Chronometer() {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    isRunning: false,
    isReset: false,
  });
  const [laps, setLaps] = useState([]);

  let timer;

  useEffect(() => {
    if (time.isRunning) {
      timer = setInterval(updateTime, 10); // Actualizamos cada 10 milisegundos
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [time.isRunning]);

  const startTimer = () => {
    if (!time.isRunning) {
      setTime({ ...time, isRunning: true });
    }
    if (time.isReset) {
      setLaps([]);
      setTime({...time, isReset: false, isRunning: true})
    }
  };

  const pauseTimer = () => {
    if (time.isRunning) {
      setTime({ ...time, isRunning: false });
    }
  };

  const resetTimer = () => {
    setTime({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      isRunning: false,
      isReset: true,
    });
  };
  //al pulsar lap, añadimos una linea nueva con el contador actual
  const lapTimer = () => {
    const lapTime = { ...time }; // Crear una copia del tiempo actual
    if (laps.length > 0) {
      const previousLapsSum = laps.reduce((total, lap) => {
        return total + lap.hours * 360000 + lap.minutes * 6000 + lap.seconds * 100 + lap.milliseconds;
      }, 0);
  
      let currentTimeInMilliseconds = lapTime.hours * 360000 + lapTime.minutes * 6000 + lapTime.seconds * 100 + lapTime.milliseconds;
      let lapTimeInMilliseconds = currentTimeInMilliseconds - previousLapsSum;
      
      lapTime.hours = Math.floor(lapTimeInMilliseconds / 360000);//3600*100 centesimas de segundo
      lapTimeInMilliseconds -= lapTime.hours * 360000;
      lapTime.minutes = Math.floor(lapTimeInMilliseconds / 6000);//60*100 centesimas de segundo
      lapTimeInMilliseconds -= lapTime.minutes * 6000;
      lapTime.seconds = Math.floor(lapTimeInMilliseconds / 100);
      lapTime.milliseconds = lapTimeInMilliseconds - lapTime.seconds * 100;
    }
    setLaps(prevLaps => [...prevLaps, lapTime]); // Agregar la vuelta al estado de laps
  };
  
  const updateTime = () => {
    setTime(prevTime => {
      const newTime = { ...prevTime };
      newTime.milliseconds += 1; // Añadimos 1 milisegundos en cada actualización

      if (newTime.milliseconds >= 100) {
        newTime.milliseconds -= 100;
        newTime.seconds++;

        if (newTime.seconds >= 60) {
          newTime.seconds = 0;
          newTime.minutes++;

          if (newTime.minutes >= 60) {
            newTime.minutes = 0;
            newTime.hours++;
          }
        }
      }

      return newTime;
    });
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Chronometer</h1>
      <div className="chronometer">
        <div className="chronometer__time">
          {/* <span>{time.hours.toString().padStart(2, '0')}:</span> */}
          <span>{time.minutes.toString().padStart(2, '0')}</span>
          <span>:</span>
          <span>{time.seconds.toString().padStart(2, '0')}</span>
          <span>:</span>
          <span>{time.milliseconds.toString().padStart(2, '0')}</span>
        </div>
        <div className="chronometer__buttons">
          <button className='button_normal' onClick={startTimer}>Start</button>
          <button className='button_normal' onClick={pauseTimer}>Pause</button>
          <button className='button_normal' onClick={resetTimer}>Reset</button>
        </div>
        <button className='button_normal' onClick={lapTimer}>Lap</button>
      </div>
      {laps.map((lap, index) => (
        <div key={index} className="lap-item">
          <span>Lap {index + 1}: </span>
          <span>
            {lap.minutes.toString().padStart(2, '0')}:
            {lap.seconds.toString().padStart(2, '0')}:
            {lap.milliseconds.toString().padStart(2, '0')}
          </span>
        </div>
      ))}
      <p className="read-the-docs">
        Click the button to Start.
      </p>
    </>
  );
}

export default Chronometer;
