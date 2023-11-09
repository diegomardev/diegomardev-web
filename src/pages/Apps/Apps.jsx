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
  
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
        Apps
    </h1>
    <div>
      <div >
      <button className="botones_juegos my-button twitch_text" onClick={app1}>Twitch Chat</button>
      {/* <button className="botones_juegos" onClick={app2}>Threads API</button> */}
      <button className="botones_juegos my-button chronometer_text" onClick={app5}>⏱️ Chronometer ⏱️</button>
      <button className="botones_juegos my-button timer_text" onClick={app6}>⏲️ Timer ⏲️</button>
      <button className="botones_juegos my-button vibration_text" onClick={app3}>📳 Vibration 📳</button>
      <button className="botones_juegos my-button sensor_text" onClick={app4}>📱 Mobile Sensor 📱</button>
      <button className="botones_juegos my-button unit_converter_text" onClick={app7}>📟 Calculators 📟</button>
      </div>
    </div>
    </>
  )
}

export default Apps