import React, { useState } from "react";
import "../../../index.css";
import "./Russian_Roulette.css";
import Navbar from "../../../components/Navbar/Navbar";
import confetti from "canvas-confetti";
import roulette from "/russian_roulette.svg";
import roulette_song from "/roulette.mp3";
import reload_shot_song from "/reload_shot.mp3";


const Russian_Roulette = () => {
  const [isSpinning, setSpinning] = useState(false);
  const [randomSpins, setRandomSpins] = useState(0);

  const startSpinning = () => {
    if (isSpinning) {return;}
    // Crear un nuevo elemento de audio
    const audio_giro = new Audio(roulette_song);
    const audio_shot = new Audio(reload_shot_song);

    setSpinning(true);

    // Genera un número aleatorio entre 30 y 50 para determinar el número de giros
    const spins = Math.floor(Math.random() * (70 - 30 + 1) + 30);
    setRandomSpins(spins);

    // Calcula la cantidad total de rotación en grados
    let totalRotation = spins * 60;

    // Aplica la rotación en CSS usando la propiedad transform
    document.querySelector('.roulette').style.transition = 'transform 3.1s ease-out';
    document.querySelector('.roulette').style.transform = `rotate(${totalRotation}deg)`;

    // Reproduce el sonido al iniciar el giro
    audio_giro.play();

    // Simula la detención después de 3 segundos
    setTimeout(() => {
      // Volvemos a poner la imagen en la posición pero sin que se vea que gire
      let girofinal = (totalRotation / 360);
      girofinal = Math.trunc(girofinal);
      girofinal = girofinal * 360;
      girofinal = totalRotation - girofinal;
      console.log(girofinal);

      // Restablecer la rotación a la posición inicial
      document.querySelector('.roulette').style.transition = 'none'; // Desactivar transición
      document.querySelector('.roulette').style.transform = `rotate(${girofinal}deg)`; // Restablecer a la posición inicial
      setSpinning(false);

      if (girofinal === 0) {
        audio_shot.play();
        confetti();
      }
    }, 3000);
  };

  return (
    <>
      <div>
        <div>
          <Navbar />
        </div>
        <h1 className="read-the-docs">Russian Roulette</h1>
      </div>
      <div>
        <div className={`roulette ${isSpinning ? 'spinning' : ''}`}>
          <img src={roulette} alt="Ruleta" onClick={startSpinning}/>
        </div>
        <button onClick={startSpinning} disabled={isSpinning} className="button_normal" style={{ position: "relative", zIndex: "1", marginTop: "100px", width: "300px", height: "75px", fontSize: "1.2rem" }}>
          {isSpinning ? 'Spinning...' : '🔫 Spin Russian Roulette 🔫'}
        </button>
        {isSpinning && <div>Good Luck!</div>}
      </div>
    </>
  );
};

export default Russian_Roulette;
