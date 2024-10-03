import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css'; // Archivo CSS para el estilo
import Navbar from '../../../components/Navbar/Navbar';
import TOKENS from '../../../../data/constants';

function Weather() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tu clave de API y coordenadas de ubicación
  const API_KEY = TOKENS.WEATHER.KEY; // Reemplaza con tu clave de API de OpenWeatherMap
  //const API_KEY = import.meta.env.API_KEY_WEATHER;
  const LATITUDE = '43.3623'; // A Coruña, España
  const LONGITUDE = '-8.4115';
  console.log(API_KEY)
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&units=metric&appid=${API_KEY}`
        );
        // Procesa los datos para agruparlos por días
        const dailyData = processDailyForecast(response.data.list);
        setWeatherData(dailyData);
        setLoading(false);
      } catch (error) {
        setError('Hubo un problema obteniendo los datos del clima.');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Función para procesar los datos por día
  const processDailyForecast = (list) => {
    const daily = {};
    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-En', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      if (!daily[day]) {
        daily[day] = {
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          rain: item.rain ? item.rain['3h'] || 0 : 0,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          weather: item.weather[0],
        };
      } else {
        daily[day].temp_max = Math.max(daily[day].temp_max, item.main.temp_max);
        daily[day].temp_min = Math.min(daily[day].temp_min, item.main.temp_min);
        daily[day].rain += item.rain ? item.rain['3h'] || 0 : 0;
      }
      // Si la hora es las 15:00, guarda el icono de las 15:00
      if (date.getHours() === 15 || date.getHours() === 14) {
        daily[day].weather = item.weather[0];
      }
    });

    return Object.entries(daily).map(([day, data]) => ({
      day,
      ...data,
    }));
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs titulo">Weather</h1>

      <div className="weather-container">
        {loading && <p>Cargando...</p>}
        {error && <p>{error}</p>}

        {weatherData && (
          <div className="forecast-list">
            {weatherData.slice(0, 14).map((forecast, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-header">
                  <span className="forecast-date"><strong>{forecast.day}</strong></span>
                </div>
                <div className="forecast-details">
                  <div className="forecast-temp">
                    <span>Máx: {forecast.temp_max.toFixed(0)}°C</span>
                    <span>Min:&nbsp; {forecast.temp_min.toFixed(0)}°C</span>
                  </div>
                  <span className="forecast-weather">
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png`}
                      alt={forecast.weather.description}
                      className="weather-icon"
                    />
                    {/* {forecast.weather.description} */}
                  </span>
                  <div className="forecast-details-2">
                    <span className="forecast-rain">🌧️ {forecast.rain ? forecast.rain.toFixed(1) : 0} mm</span>
                    <span className="forecast-wind">💨 {forecast.wind_speed.toFixed(0)} km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Weather;
