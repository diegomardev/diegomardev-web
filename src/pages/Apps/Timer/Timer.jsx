import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Timer.css';
import confetti from 'canvas-confetti'

function Timer() {
  const [countdownTime, setCountdownTime] = useState({
    minutes: 1,
    seconds: 0,
    centiseconds: 0,
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;

    if (isRunning) {
      timer = setInterval(updateCountdown, 10); // Actualizamos cada 10 milisegundos
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  const startCountdown = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const pauseCountdown = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const resetCountdown = () => {
    setIsRunning(false);
    setCountdownTime({
      minutes: 1,
      seconds: 0,
      centiseconds: 0,
    });
  };

  const updateCountdown = () => {
    setCountdownTime(prevTime => {
      const newTime = { ...prevTime };

      if (newTime.centiseconds === 0) {
        if (newTime.seconds === 0) {
          if (newTime.minutes === 0) {
            pauseCountdown();
            confetti();
            navigator.vibrate([500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500])
            return newTime;
          }
          newTime.minutes -= 1;
          newTime.seconds = 59;
        } else {
          newTime.seconds -= 1;
        }
        newTime.centiseconds = 99;
      } else {
        newTime.centiseconds -= 1;
      }

      return newTime;
    });
  };

  const handleMinutesChange = e => {
    const newValue = parseInt(e.target.value);
    setCountdownTime(prevTime => ({ ...prevTime, minutes: newValue }));
  };

  const handleSecondsChange = e => {
    const newValue = parseInt(e.target.value);
    setCountdownTime(prevTime => ({ ...prevTime, seconds: newValue }));
  };

  const handleCentisecondsChange = e => {
    const newValue = parseInt(e.target.value);
    setCountdownTime(prevTime => ({ ...prevTime, centiseconds: newValue }));
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Timer</h1>
      <div className="chronometer">
        <div className="chronometer__time">
          <input
            type="number"
            value={countdownTime.minutes}
            onChange={handleMinutesChange}
            min="0"
          />
          <span>:</span>
          <input
            type="number"
            value={countdownTime.seconds}
            onChange={handleSecondsChange}
            min="0"
            max="59"
          />
          <span>:</span>
          <input
            type="number"
            value={countdownTime.centiseconds}
            onChange={handleCentisecondsChange}
            min="0"
            max="99"
          />
        </div>
        <div className="countdown-timer__buttons">
          <button className='button_normal' onClick={startCountdown}>Start</button>
          <button className='button_normal' onClick={pauseCountdown}>Pause</button>
          <button className='button_normal' onClick={resetCountdown}>Reset</button>
        </div>
      </div>      
      <p className="read-the-docs">
        Set the countdown time and click Start.
      </p>
    </>
  );
}

export default Timer;

