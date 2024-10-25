import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './pages/Home/Home'
import HomeTest from './pages/HomeTest/HomeTest'
import Games from './pages/Games/Games'
import Snake from './pages/Games/Snake/Snake'
import Click from './pages/Games/Click_Game/Click_Game'
import Dino from './pages/Games/Dino/Dino'
import Pixel_Art from './pages/Games/Pixel_Art/Pixel_Art'
import Tetris from './pages/Games/Tetris/Tetris'
import Russian_Roulette from './pages/Games/Russian_Roulette/Russian_Roulette'
import Apps from './pages/Apps/Apps'
import Twitch_Chat from './pages/Apps/Twitch_Chat/Twitch_Chat'
import Threads_API from './pages/Apps/Threads_API/Threads_API'
import Vibration from './pages/Apps/Vibration/Vibration'
import Sensor_Data from './pages/Apps/Sensor_Data/Sensor_Data'
import Chronometer from './pages/Apps/Chronometer/Chronometer'
import Timer from './pages/Apps/Timer/Timer'
import Calculators from './pages/Apps/Calculators/Calculators'
import Aspect_Ratio from './pages/Apps/Calculators/Aspect_Ratio/Aspect_Ratio'
import Coordinate_Converter from './pages/Apps/Calculators/Coordinate_Converter/Coordinate_Converter'
import Area_Calculator from './pages/Apps/Calculators/Area_Calculator/Area_Calculator'
import Map from './pages/Apps/Map/Map'
import Birthday_Cake from './pages/Apps/Birthday_Cake/Birthday_Cake'
import Threejs from './pages/Apps/Threejs/Threejs'
import Chat from './pages/Apps/Chat/Chat'
import Sorteo from './pages/Apps/Sorteo/Sorteo'
import Pokedex from './pages/Apps/Pokedex/Pokedex'
import Weather from './pages/Apps/Weather/Weather'
import Contact from './pages/Contact/Contact'
import Blog from './pages/Blog/Blog'
import About from './pages/About/About'
import Login from './pages/Login/Login'
import PageNotFound from './pages/PageNotFound/PageNotFound'

function App() {
  //La linea de route path="*" element={<PageNotFound />} sirve para que siempre que no encuentre una ruta, aparezca la pagina de error
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/hometest" element={<HomeTest />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/snake" element={<Snake />} />
        <Route path="/games/click_game" element={<Click />} />
        <Route path="/games/dino" element={<Dino />} />
        <Route path="/games/pixel_art" element={<Pixel_Art />} />
        <Route path="/games/tetris" element={<Tetris />} />
        <Route path="/games/russian_roulette" element={<Russian_Roulette />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/twitch_chat" element={<Twitch_Chat />} />
        <Route path="/apps/threads_api" element={<Threads_API />} />
        <Route path="/apps/vibration" element={<Vibration />} />
        <Route path="/apps/sensor_data" element={<Sensor_Data />} />
        <Route path="/apps/chronometer" element={<Chronometer />} />
        <Route path="/apps/timer" element={<Timer />} />
        <Route path="/apps/calculators" element={<Calculators />} />
        <Route path="/apps/calculators/aspect_ratio" element={<Aspect_Ratio />} />
        <Route path="/apps/calculators/coordinate_converter" element={<Coordinate_Converter />} />
        <Route path="/apps/calculators/area_calculator" element={<Area_Calculator />} />
        <Route path="/apps/map" element={<Map />} />
        <Route path="/apps/birthday_cake" element={<Birthday_Cake />} />
        <Route path="/apps/threejs" element={<Threejs />} />
        <Route path="/apps/chat" element={<Chat />} />
        <Route path="/apps/sorteo" element={<Sorteo />} />
        <Route path="/apps/pokedex" element={<Pokedex />} />
        <Route path="/apps/weather" element={<Weather />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;