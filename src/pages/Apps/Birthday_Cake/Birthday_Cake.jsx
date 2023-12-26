import React, { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import confetti from 'canvas-confetti';
import { candles_init } from './candles';
import './Birthday_Cake.css';

function Birthday_Cake() {
  const [candles, setCandles] = useState(candles_init);
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
    } else if (newCandlesCount < currentCandlesCount) {
      // Quitar velas
      const diff = currentCandlesCount - newCandlesCount;
      setCandles(candles.slice(0, currentCandlesCount - diff));
    }
  };
  const addCandleRandom = () => {
    const newCandle = {
      id: candles.length + 1,
      top: (Math.random() * 30)-15, // Posición vertical aleatoria
      left: (Math.random() * 90)+5, // Posición horizontal aleatoria
    };
    setCandles([...candles, newCandle]);
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      Years old
      <input
        type="number"
        value={candles.length}
        onChange={handleInputChange}
        min="0"
        max="150"
      />
      <div className="cake" >
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
            style={{ top: `${candle.top}%`, left: `${candle.left}%`, zIndex:`${Math.round(candle.top)+20}`}}
          >
            <div className="flame"></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Birthday_Cake;
