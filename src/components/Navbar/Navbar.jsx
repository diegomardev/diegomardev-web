import React, { useState, useEffect } from 'react';
import './Navbar.css';
import demonlogo from '../../assets/images/demon.svg';
import rocket from '../../assets/images/rocket.svg';

import {IconHome} from '@tabler/icons-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userLogged, setUserLogged] = useState(localStorage.getItem('user_logged'));
  const [darkMode, setDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('dark-mode');
    if (storedDarkMode !== null) {
      return storedDarkMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark-mode', darkMode.toString());
  }, [darkMode]);
  
  function gohome() {
    window.location.href = '/home';
  }

  const handleDarkModeChange = () => {
    setDarkMode(!darkMode);
  };
  
  useEffect(() => {
    // Establecer el intervalo en el montaje del componente
    const loginInterval = setInterval(() => {
      if (localStorage.getItem('user_logged') !== null) {
        setUserLogged(localStorage.getItem('user_logged'));
      } else {
        setUserLogged('');
      }
    }, 1000);

    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(loginInterval);
  }, []); // El segundo argumento de useEffect es un array de dependencias, que está vacío en este caso.

  return (
    <div className='navbar_cabecera'>
      {/* <img src={demonlogo} className='navbar_logo' onClick={gohome} /> */}
      {/* <IconHome className='navbar_logo' onClick={gohome} size={50}/> */}
      <img src={rocket} className='navbar_logo' onClick={gohome} />
      <div className={`navbar_toggle ${isOpen && "open"}`} onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`navbar_items ${isOpen && "open"}`}>
        <a href='/home'>Home</a>
        <a href='/games'>Games</a>
        <a href='/apps'>Apps</a>
        <a href='/blog'>Blog</a>
        <a href='/contact'>Contact</a>
        <a href='/about'>About</a>
        {userLogged ? (
          <a href='/login'>{userLogged.charAt(0).toUpperCase()+userLogged.slice(1)}</a>
        ) : (
          <a href='/login'>Login</a>
        )}
      </div>
      <label className="switch_dark" id="switch_dark">
        <span className="sun">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="#ffd43b">
              <circle r="5" cy="12" cx="12"></circle>
              <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
            </g>
          </svg>
        </span>
        <span className="moon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
          </svg>
        </span>
        <input type="checkbox" className="input" checked={darkMode} onChange={handleDarkModeChange} />
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default Navbar;