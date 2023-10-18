import { useState } from 'react'
import confetti from 'canvas-confetti'
import Navbar from '../../components/Navbar/Navbar'
import './Blog.css'

function Blog() {
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Blog</h1>
      <div className='blog-container'>
        <h2 className='article-title'>
          Nuevo Sonoff SNZB-06P
        </h2>
        <img
          src="https://sonoff.tech/wp-content/uploads/2023/10/%E5%AE%98%E7%BD%91_01_09.jpg"
          alt=""
          className="scaled-image"
        />
        <h3 className='article-subtitle'>Descubre el Futuro de la Detección de Presencia con Sonoff: SNZB-06P</h3>
        <p className='article-text'>
          El líder en innovación tecnológica, Sonoff, ha dado un paso gigante en el mundo de la domótica con el lanzamiento de su último producto: el SNZB-06P, un sensor de presencia humana mmwave con conectividad Zigbee. ¿Lo mejor de todo? Es una solución sencilla y económica que hará que tu hogar inteligente sea aún más inteligente.
        </p>
        <p className='article-text'>
          El SNZB-06P es compatible con una variedad de plataformas, incluyendo ZHA, Zigbee2MQTT, el propio hub de Sonoff, y el popular Amazon Echo 4. Esto significa que puedes integrar este dispositivo en tu ecosistema domótico existente sin problemas, brindándote un control total sobre tu hogar desde cualquier lugar.
        </p>
        <h3 className='article-subtitle'>Sencillez y Eficiencia en Uno</h3>
        <p className='article-text'>
          Este sensor de presencia es un verdadero ejemplo de sencillez. Su tecnología mmwave es altamente eficiente para detectar la presencia humana en una habitación, lo que lo convierte en un activador ideal para tus dispositivos inteligentes. Ya sea para encender las luces automáticamente al entrar a una habitación, ajustar la temperatura de tu termostato, o realizar una serie de acciones personalizadas, el SNZB-06P es una solución versátil que mejora la comodidad en tu hogar.
        </p>
        <h3 className='article-subtitle'>Asequibilidad Sin Sacrificar Calidad</h3>
        <p className='article-text'>
          En el mundo de la tecnología, a menudo se asocia la calidad con un alto precio. Sin embargo, Sonoff desafía esta norma con el SNZB-06P. Este sensor de presencia mmwave ofrece un rendimiento excepcional a un precio accesible, lo que lo convierte en una opción atractiva para aquellos que buscan mejorar su hogar inteligente sin gastar una fortuna.
        </p>
        <p className='article-text'>
          Así que, si estás buscando una forma sencilla y asequible de llevar tu hogar inteligente al siguiente nivel, el Sonoff SNZB-06P es una opción que no debes pasar por alto. Con su fácil integración, conectividad Zigbee y su capacidad para mejorar la eficiencia y comodidad en tu hogar, este sensor está destinado a ser un elemento imprescindible en tu hogar inteligente.
        </p>
        <p className='article-text'>
          Descubre cómo el futuro de la detección de presencia está al alcance de tu mano con el SNZB-06P de Sonoff. ¡No esperes más para dar un paso hacia un hogar más inteligente y eficiente!
        </p>
      </div>
    </>
  )
}

export default Blog
