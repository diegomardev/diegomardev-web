import { useState } from 'react'
import './Apps.css'
import Navbar from '../../components/Navbar/Navbar'

function Apps() {

  //ESTA FUNCION ME REDIRIGE A OTRA PAGINA
  function app1() {window.location.href = "apps/twitch_chat";}
  function app2() {window.location.href = "apps/threads_api";}
  function app3() {window.location.href = "apps/vibration";}
  function app4() {window.location.href = "apps/sensor_data";}
  function app5() {window.location.href = "apps/chronometer";}
  function app6() {window.location.href = "apps/timer";}
  function app7() {window.location.href = "apps/calculators";}
  function app8() {window.location.href = "apps/map";}
  function app9() {window.location.href = "apps/birthday_cake";}
  function app10() {window.location.href = "apps/threejs";}
  function app11() {window.location.href = "apps/chat";}
  function app12() {window.location.href = "apps/sorteo";}
  function app13() {window.location.href = "apps/pokedex";}
  function app14() {window.location.href = "apps/weather";}
  function app15() {window.location.href = "apps/radio";}
  
  
  
  
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
        Apps
    </h1>
    <div style={{ maxWidth: '1400px', margin: '0 auto'}}>
      <div >
      <button className="botones_juegos my-button twitch_text" onClick={app1}>Twitch Chat</button>
      {/* <button className="botones_juegos" onClick={app2}>Threads API</button> */}
      <button className="botones_juegos my-button chronometer_text" onClick={app5}>⏱️ Chronometer ⏱️</button>
      <button className="botones_juegos my-button timer_text" onClick={app6}>⏲️ Timer ⏲️</button>
      <button className="botones_juegos my-button vibration_text" onClick={app3}>📳 Vibration 📳</button>
      <button className="botones_juegos my-button sensor_text" onClick={app4}>📱 Mobile Sensor 📱</button>
      <button className="botones_juegos my-button unit_converter_text" onClick={app7}>📟 Calculators 📟</button>
      <button className="botones_juegos my-button map_text" onClick={app8}>🗺️ Map 🗺️</button>
      <button className="botones_juegos my-button birthdaycake_text" onClick={app9}>🎂 Birthday Cake 🎂</button>
      <button className="botones_juegos my-button threejs_text" onClick={app10}>🌐 3D STL Viewer 🌐</button>
      <button className="botones_juegos my-button chat_text" onClick={app11}>💬 Chat 💬</button>
      <button className="botones_juegos my-button chat_text" onClick={app12}> Sorteo </button>
      <button className="botones_juegos my-button chat_text" onClick={app13}>🐉 Pokedex 🐉</button>
      <button className="botones_juegos my-button chat_text" onClick={app14}>🌦️ Weather 🌦️</button>
      <button className="botones_juegos my-button radio_text" onClick={app15}>📻 Radio 📻</button>
      {/* <button className="botones_juegos" onClick={app15}>���️</button> */}
      </div>
    </div>
    </>
  )
}

export default Apps