import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import confetti from 'canvas-confetti';
import { candles_init } from './candles';
import './Birthday_Cake.css';

function Birthday_Cake() {
  const [candles, setCandles] = useState(candles_init);
  const [blowButtonPressed, setBlowButtonPressed] = useState(false);
  const [litCandlesCount, setLitCandlesCount] = useState(0); // Nuevo estado para contar las velas encendidas

  const blowButtonPressedRef = useRef(blowButtonPressed);

  const addCandle = (event) => {
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const newCandle = {
      id: candles.length + 1,
      top: (((event.clientY - boundingRect.top) / boundingRect.height) * 40)-20,
      left: ((event.clientX - boundingRect.left) / boundingRect.width) * 100,
    };
    setCandles([...candles, newCandle]);
  };

  const handleInputChange = (event) => {
    const newCandlesCount = parseInt(event.target.value, 10);
    const currentCandlesCount = candles.length;

    if (newCandlesCount > currentCandlesCount) {
      // Añadir velas
      const diff = newCandlesCount - currentCandlesCount;
      for (let i = 0; i < diff; i++) {
        addCandleRandom();
      }
    } else if (newCandlesCount === currentCandlesCount-1) {
      // Quitar velas
      const diff = currentCandlesCount - newCandlesCount;
      setCandles(candles.slice(0, currentCandlesCount - diff));
      // Actualizar el conteo de velas encendidas
      if(litCandlesCount > 0)
      setLitCandlesCount((prevCount) => prevCount - 1);
    }
    else if(newCandlesCount < currentCandlesCount){
      // Quitar velas
      const diff = currentCandlesCount - newCandlesCount;
      setCandles(candles.slice(0, currentCandlesCount - diff));
      // Actualizar el conteo de velas encendidas
      setLitCandlesCount(currentCandlesCount - diff);
    }
  };
  const addCandleRandom = () => {
    const newCandle = {
      id: candles.length + 1,
      top: (Math.random() * 30)-15, // Posición vertical aleatoria
      left: (Math.random() * 90)+5, // Posición horizontal aleatoria
      isBlown: false,
    };
    setCandles([...candles, newCandle]);
  };
  const blowCandles = () => {
    // Iniciar la secuencia de apagado de velas
    setBlowButtonPressed(true);
  };
  function encender_velas() {
    const nuevasVelas = candles.map((candle) => ({
      ...candle,
      isBlown: false,
    }));
    setCandles(nuevasVelas);
    setLitCandlesCount(0);
  }
  const blowCandlesSequentially = (index) => {
    setTimeout(() => {
      if (index < candles.length && blowButtonPressedRef.current) {
        setCandles((prevCandles) => {
          const updatedCandles = [...prevCandles];
          updatedCandles[index] = { ...updatedCandles[index], isBlown: true };
          return updatedCandles;
        });

        if (!blowButtonPressedRef.current) {
          console.log("Blow button released");
          clearTimeout(timeout);
        }

        // Actualizar el conteo de velas encendidas
        setLitCandlesCount((prevCount) => prevCount + 1);

        blowCandlesSequentially(index + 1);
      }
    }, 100);
  };

useEffect(() => {
  blowButtonPressedRef.current = blowButtonPressed;
}, [blowButtonPressed]);
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">🎂 Happy Birthday! 🎂</h1>
      <div className="cake">
        <div className="plate"></div>
        <div className="layer layer-bottom"></div>
        <div className="layer layer-middle"></div>
        <div className="layer layer-top"></div>
        <div className="icing" onClick={addCandle}></div>
        <div className="drip drip1"></div>
        <div className="drip drip2"></div>
        <div className="drip drip3"></div>
        {candles.map((candle) => (
          <div
            key={candle.id}
            className={`candle ${candle.id === candles.length ? "fall" : ""}`}
            style={{
              top: `${candle.top}%`,
              left: `${candle.left}%`,
              zIndex: `${Math.round(candle.top) + 20}`,
            }}
          >
            {!candle.isBlown && <div className="flame"></div>}
          </div>
        ))}
      </div>
      <div className='posicion_texto'>
        <div>
          Years old
          <input
            type="number"
            value={candles.length}
            onChange={handleInputChange}
            min="0"
            max="150"
          />
        </div>

        <div>
          Blown out candles: {litCandlesCount} -
          <button
            onMouseDown={() => {
              setBlowButtonPressed(true);
              blowCandlesSequentially(litCandlesCount);
            }}
            onMouseUp={() => setBlowButtonPressed(false)}
            onTouchStart={() => {
              setBlowButtonPressed(true);
              blowCandlesSequentially(litCandlesCount);
            }}
            onTouchEnd={() => setBlowButtonPressed(false)}
          >
            Blow candles 💨 🎂
          </button>
        </div>
        <div>
          <button onClick={encender_velas}>Encender velas 🕯️</button>
        </div>
      </div>
    </>
  );
}

export default Birthday_Cake;
