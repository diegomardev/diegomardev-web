import { useState } from 'react'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
import confetti from 'canvas-confetti'
//import './Home.css'
import Navbar from '../../components/Navbar/Navbar'

let x = 0;
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
function Blog() {
  //const [variable, setVariable] = useState(valorInicial);
  const [count, setCount] = useState(0)//el 0 de usestate es el valor inicial
  const [confetti_count, setConfetti] = useState(0)
  //creamos otra variable con useState

  const handleClick = () => {
    x++;
    console.log(x);
  };
  function handleClick2() {
    confetti();
    setConfetti((confetti_count) => confetti_count + 1);
  }
  function handleClick3() {
    fireworks();
    setCount((count) => count + 1);
  }
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
        Blog
    </h1>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="click_text" onClick={handleClick2}>🎉</h1>
      <div className="card">
        <div >
          <button className="botones button_normal" onClick={handleClick}>let: {x}</button>
          <button className="botones button_normal" onClick={handleClick2}>🎉 {confetti_count}</button>
          <button className="botones button_normal" onClick={handleClick3}>🎊 {count}</button>
        </div>
        
        <p>
          Variable normal(no se actualiza automaticamente): {x}
        </p>
        <p>
          Variable useState confetti: {confetti_count}
        </p>
        <p>
          Variable useState count: {count}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default Blog