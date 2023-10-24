import { useState } from 'react'
import './Calculators.css'
import Navbar from '../../../components/Navbar/Navbar'

function Apps() {

  //ESTA FUNCION ME REDIRIGE A OTRA PAGINA
  function app1() {window.location.href = "calculators/aspect_ratio";}
  function app2() {window.location.href = "unit_converter/threads_API";}
  function app3() {window.location.href = "unit_converter/Vibration";}
  function app4() {window.location.href = "unit_converter/Sensor_data";}
  function app5() {window.location.href = "unit_converter/Chronometer";}
  function app6() {window.location.href = "unit_converter/Timer";}
  
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
      Calculators
    </h1>
    <div>
      <div >
      <button className="botones_juegos my-button twitch_text" onClick={app1}>📱Aspect Ratio📱</button>
      {/* <button className="botones_juegos" onClick={app2}>Threads API</button> */}
      </div>
    </div>
    </>
  )
}

export default Apps