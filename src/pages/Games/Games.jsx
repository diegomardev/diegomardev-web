import { useState } from 'react'
import confetti from 'canvas-confetti'
import './Games.css'
import Navbar from '../../components/Navbar/Navbar'

let x = 0;
let clickX = 0; // Coordenada x relativa al ancho de la ventana
let clickY = 0;// Coordenada y relativa al alto de la ventana
function fireworks(){
  var duration = 5 * 1000; //5 segundos de duracion
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.5), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.5, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}
function confetti_click(){
  confetti({
      origin: {
        x: clickX,
        y: clickY
      }
    });
}
// Agregar controlador de eventos de clic al documento

// El evento se dispara cuando se mueve el ratón
document.addEventListener('mousemove', function(event) {
  // Obtener coordenadas del evento de clic
  clickX = event.clientX / window.innerWidth; // Coordenada x relativa al ancho de la ventana
  clickY = event.clientY / window.innerHeight; // Coordenada y relativa al alto de la ventana
});

function Games() {
  //const [variable, setVariable] = useState(valorInicial);
  const [count, setCount] = useState(0)//el 0 de usestate es el valor inicial
  const [confetti_count, setConfetti] = useState(0)
  //creamos otra variable con useState

  const handleClick = () => {
    x++;
    console.log(x);
  };
  function handleClick2() {
    //confetti();
    confetti_click();
    setConfetti((confetti_count) => confetti_count + 1);
  }
  function handleClick3() {
    fireworks();
    setCount((count) => count + 1);
  }
  //ESTA FUNCION ME REDIRIGE A OTRA PAGINA
  function game1() {window.location.href = "games/snake";}
  function game2() {window.location.href = "games/click_game";}
  function game3() {window.location.href = "games/dino"};
  function game4() {window.location.href = "games/pixel_art";}
  function game5() {window.location.href = "games/tetris";}
  function game6() {window.location.href = "games/russian_roulette";}
  
  
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
        Games
    </h1>
    <div style={{ maxWidth: '1400px', margin: '0 auto'}}>
      <div >
      <button className="botones_juegos" onClick={game1}>🐍 Snake 🐍</button>
      <button className="botones_juegos" onClick={game2}>🖱️ Click 🖱️</button>
      <button className="botones_juegos" onClick={game3}>🦖 Dino 🦖</button>
      <button className="botones_juegos" onClick={game4}>🟦🟪 Pixel Art 🟩🟥</button>
      {/* <button className="botones_juegos" onClick={game5}>🔰 Tetris 🔰</button> */}
      <button className="botones_juegos" onClick={game6}>🔫 Russian Roulette 🔫</button>
      </div>
    </div>
    </>
  )
}

export default Games