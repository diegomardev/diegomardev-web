import React, { useState, useEffect } from 'react';
import '../../../index.css';
import './Vibration.css';
import Navbar from '../../../components/Navbar/Navbar';

function Vibration() {
  let [vibrationTime, setVibrationTime] = useState(200);
  const handleVibrationButtonClick = () => {
    navigator.vibrate(vibrationTime);
  };
  function supermario() {
    navigator.vibrate([125,75,125,275,200,275,125,75,125,275,200,600,200,600])
  }
  
  function starwars() {
    navigator.vibrate([500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500])
  }
  
  function powerrangers() {
    navigator.vibrate([150,150,150,150,75,75,150,150,150,150,450])
  }
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Vibration</h1>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(200);}}>STOP</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(200);}}>Vibrate 200ms</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(500);}}>Vibrate 500ms</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(1000);}}>Vibrate 1000ms</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(2000);}}>Vibrate 2000ms</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {navigator.vibrate(5000);}}>Vibrate 5000ms</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {supermario();}}>Super Mario Bros</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {starwars();}}>Star Wars</button>
      <button className="botones_juegos my-button vibration_text" onClick={() => {powerrangers();}}>Power Rangers</button>
      <button className="botones_juegos my-button vibration_text" onClick={handleVibrationButtonClick}>
        Vibrate {vibrationTime}ms
      </button>
      <input
        className='input_vibration'
        type="number"
        name="vibration"
        id="vibration"
        placeholder="Vibration time"
        value={vibrationTime}
        onChange={(e) => setVibrationTime(Number(e.target.value))}
      />
      <p className="read-the-docs">
        Click the button to vibrate the device.
      </p>
    </>
  );
}

export default Vibration;
