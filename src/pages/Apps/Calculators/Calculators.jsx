import { useState } from 'react'
import './Calculators.css'
import Navbar from '../../../components/Navbar/Navbar'

function Apps() {

  //ESTA FUNCION ME REDIRIGE A OTRA PAGINA
  function app1() {window.location.href = "calculators/aspect_ratio";}
  function app2() {window.location.href = "calculators/coordinate_converter";}
  function app3() {window.location.href = "calculators/area_calculator";}
  
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
      <button className="botones_juegos my-button " onClick={app1}>🖥️ Aspect Ratio 🖥️</button>
      <button className="botones_juegos my-button " onClick={app2}>🗺️ Coordinate Converter 🗺️</button>
      <button className="botones_juegos my-button " onClick={app3}>🗺️ Map Area Calculator 🗺️</button>
      </div>
    </div>
    </>
  )
}

export default Apps