import { useState } from 'react'
import confetti from 'canvas-confetti'
import Navbar from '../../components/Navbar/Navbar'
import './Blog.css'

function Blog() {

  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
        Blog
    </h1>
    <div className='blog-container'>
      <h2 className='article-title'>
        Nuevo Sonoff SNZB-06P
      </h2>
      <img 
        src="https://sonoff.tech/wp-content/uploads/2023/10/%E5%AE%98%E7%BD%91_01_09.jpg" 
        alt="" 
        className="scaled-image" 
      />

      <p>
        Sonoff acaba de anunciar el nuevo SNZB-06P, un sensor mmwave de presencia humana con conectividad Zigbee y compatible con ZHA, Zigbee2MQTT, el hub de sonoff y el Amazon Echo 4. Es un sensor SENCILLO y BARATO.
      </p>
    </div>
    
    </>
  )
}

export default Blog