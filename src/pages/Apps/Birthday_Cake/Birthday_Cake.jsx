import React, { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import confetti from 'canvas-confetti';
import './Birthday_Cake.css';

function Birthday_Cake() {
  const [candles, setCandles] = useState(
  [
    {
        "id": 1,
        "top": -20.75,
        "left": 53
    },
    {
        "id": 2,
        "top": -17.75,
        "left": 38.6
    },
    {
        "id": 3,
        "top": -17.25,
        "left": 28.199999999999996
    },
    {
        "id": 4,
        "top": -13.25,
        "left": 17
    },
    {
        "id": 5,
        "top": -4.75,
        "left": 6.6000000000000005
    },
    {
        "id": 6,
        "top": -18.25,
        "left": 63
    },
    {
        "id": 7,
        "top": -16.75,
        "left": 74.6
    },
    {
        "id": 8,
        "top": -12.25,
        "left": 84.2
    },
    {
        "id": 9,
        "top": -5.75,
        "left": 92.2
    },
    {
        "id": 10,
        "top": 3.2500000000000036,
        "left": 90.2
    },
    {
        "id": 11,
        "top": 7.75,
        "left": 82.19999999999999
    },
    {
        "id": 12,
        "top": 10.75,
        "left": 72.2
    },
    {
        "id": 13,
        "top": 13.75,
        "left": 62.2
    },
    {
        "id": 14,
        "top": 12.25,
        "left": 50.2
    },
    {
        "id": 15,
        "top": 10.75,
        "left": 37.4
    },
    {
        "id": 16,
        "top": 7.75,
        "left": 24.2
    },
    {
        "id": 17,
        "top": 4.7499999999999964,
        "left": 13.8
    }
]
);
  const addCandle = (event) => {
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const newCandle = {
      id: candles.length + 1,
      top: (((event.clientY - boundingRect.top) / boundingRect.height) * 100) - 24,
      left: ((event.clientX - boundingRect.left) / boundingRect.width) * 100,
    };
    setCandles([...candles, newCandle]);

    console.log(candles)
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
      <div className="cake" onClick={addCandle}>
        <div className="plate"></div>
        <div className="layer layer-bottom"></div>
        <div className="layer layer-middle"></div>
        <div className="layer layer-top"></div>
        <div className="icing"></div>
        <div className="drip drip1"></div>
        <div className="drip drip2"></div>
        <div className="drip drip3"></div>
        {candles.map((candle) => (
          <div
            key={candle.id}
            className={`candle ${candle.id === candles.length ? "fall" : ""}`}
            style={{ top: `${candle.top}%`, left: `${candle.left}%` }}
          >
            <div className="flame"></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Birthday_Cake;
