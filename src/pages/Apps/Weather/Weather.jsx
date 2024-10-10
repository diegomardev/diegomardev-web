import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css'; // Archivo CSS para el estilo
import Navbar from '../../../components/Navbar/Navbar';
import TOKENS from '../../../../data/constants';

function Weather() {
  const [weatherData, setWeatherData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('days'); // Estado para cambiar entre días y horas
  const [city, setCity] = useState('A Coruña'); // Ciudad inicial
  const [coordinates, setCoordinates] = useState({ lat: '43.3713', lon: '-8.396' });

  const API_KEY = TOKENS.WEATHER.KEY;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${API_KEY}`
        );
        const dailyData = processDailyForecast(response.data.list);
        setWeatherData(dailyData);
        const hourlyData = processHourlyForecast(response.data.list);
        setHourlyData(hourlyData);
        setLoading(false);
      } catch (error) {
        setError('Hubo un problema obteniendo los datos del clima.');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [coordinates]);

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const searchCity = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );
      const { coord } = response.data;
      console.log(coord);
      setCoordinates({ lat: coord.lat, lon: coord.lon });
    } catch (error) {
      setError('No se pudo encontrar la ciudad.');
    }
  };

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
          wind_speed: item.wind.speed * 3.6,
          wind_deg: item.wind.deg,
          weather: item.weather[0],
        };
      } else {
        daily[day].temp_max = Math.max(daily[day].temp_max, item.main.temp_max);
        daily[day].temp_min = Math.min(daily[day].temp_min, item.main.temp_min);
        daily[day].rain += item.rain ? item.rain['3h'] || 0 : 0;
      }
      if (date.getHours() === 15 || date.getHours() === 14) {
        daily[day].weather = item.weather[0];
      }
    });

    return Object.entries(daily).map(([day, data]) => ({
      day,
      ...data,
    }));
  };

  const processHourlyForecast = (list) => {
    return list.map((item) => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleString('en-En', {
          weekday: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
        temp: item.main.temp,
        rain: item.rain ? item.rain['3h'] || 0 : 0,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed * 3.6,
        wind_deg: item.wind.deg,
        weather: item.weather[0],
      };
    });
  };

  const handleDays = () => {
    setViewMode('days');
  };

  const handleHours = () => {
    setViewMode('hours');
  };
  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback(e);
    }
  };
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs titulo">Weather</h1>
      <div>
      <div className="input-weather">
          <input
            id='login_1'
            required
            type="text"
            name="text"
            autoComplete="off"
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, searchCity)}
          />
          <label htmlFor="login_1" className="user-label-weather">Find City - Enter to Find</label>
        </div>
        <button className="button_normal button-weather" onClick={handleDays}>
          Days
        </button>
        <button className="button_normal button-weather" onClick={handleHours}>
          Hours
        </button>
      </div>
      <div className="weather-container">
        {loading && <p>Cargando...</p>}
        {error && <p>{error}</p>}

        {viewMode === 'days' && weatherData && (
          <div className="forecast-list">
            {weatherData.slice(0, 14).map((forecast, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-header">
                  <span className="forecast-date">
                    <strong>{forecast.day}</strong>
                  </span>
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
                  </span>
                  <div className="forecast-details-2">
                    <span className="forecast-rain">🌧️ {forecast.rain ? forecast.rain.toFixed(1) : 0} mm</span>
                    <span className="forecast-wind" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ transform: `rotate(${forecast.wind_deg + 90}deg)`, display: 'inline-block' }}>💨</span>
                      <span style={{ marginLeft: '5px'}}> {forecast.wind_speed.toFixed(0)} km/h</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'hours' && hourlyData && (
          <div className="forecast-list">
            {hourlyData.slice(0, 40).map((forecast, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-header">
                  <span className="forecast-date">
                    <strong>{forecast.time}</strong>
                  </span>
                </div>
                <div className="forecast-details">
                  <div className="forecast-temp">
                    <span>Temp: {forecast.temp.toFixed(0)}°C</span>
                  </div>
                  <span className="forecast-weather">
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png`}
                      alt={forecast.weather.description}
                      className="weather-icon"
                    />
                  </span>
                  <div className="forecast-details-2">
                    <span className="forecast-rain">🌧️ {forecast.rain ? forecast.rain.toFixed(1) : 0} mm</span>
                    <span className="forecast-wind" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ transform: `rotate(${forecast.wind_deg + 90}deg)`, display: 'inline-block' }}>💨</span>
                      <span style={{ marginLeft: '5px'}}> {forecast.wind_speed.toFixed(0)} km/h</span>
                    </span>
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
