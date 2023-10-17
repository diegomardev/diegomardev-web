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
      <p className="read-the-docs">
        ERROR PAGINA NO ENCONTRADA
      </p>
    </>
  )
}

export default Blog