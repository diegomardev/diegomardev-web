import React, { useState, useEffect } from 'react';
import reactLogo from '../../assets/react.svg';
import viteLogo from '/vite.svg';
import diegomar from '../../assets/users/diegomar.jpg';
import confetti from 'canvas-confetti';
import './Login.css';
import Navbar from '../../components/Navbar/Navbar';
import Atropos from 'atropos';
import MyCard from './MyCard';
import { Flip, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClient } from '@supabase/supabase-js';
import TOKENS from '../../../data/constants';
// Configura tu conexión a Supabase
//console.log(TOKENS_SUPABASE)
const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Initialize
const myAtropos = Atropos({
  el: '.my-atropos',
  // rest of parameters
});

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para controlar el estado de inicio de sesión
  const [isRegister, setIsRegister] = useState(false); // Estado para controlar el estado de inicio de sesión

  // Estado para los inputs

  const [nameInput, setNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [repeatPasswordInput, setRepearPasswordInput] = useState('');

  const notify = (mensaje) => toast.warning(mensaje, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    });
  const notify_ok = (mensaje) => toast.success(mensaje, {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    });

  // Función para alternar entre logueado y no logueado
  const handleLoginToggle = () => {
    if(isLoggedIn===false){
      setIsRegister(false);
    }
    setIsLoggedIn(!isLoggedIn);
  };
  // Función para alternar entre registrarse y no registrarse
  const handleRegisterToggle = () => {
    setIsRegister(!isRegister);
  };
  const handletoRegister = () => {
    setIsRegister(true);
  };
  const handletoLogin = () => {
    if(isLoggedIn){setIsLoggedIn(false)}
    setIsRegister(false);
    localStorage.setItem('user_logged', 0);
  };
  //Función para validar el usuario y la contraseña
  async function handleLogin(e) {
    e.preventDefault();
    try {
      if (userInput.length>=3 && passwordInput.length>=6) {
        const tableName = 'Users';
        const { data, error } = await supabase
          .from(tableName)
          .select()
          /* .eq('user', userInput) // Buscar el usuario por nombre de usuario */
          .or(`user.eq.${userInput},email.eq.${userInput}`)
          .eq('password', passwordInput) // Y también por contraseña
          .single(); // Solo esperamos un resultado
    
        if (error) {
          notify('Incorrect username or password');
          return;
        }
    
        if (data) {
          setIsLoggedIn(true);
          localStorage.setItem('user_logged', userInput);
          confetti();
          notify_ok('Logged in');
        } else {
          notify('Incorrect username or password');
        }
      }
      else{
        notify("Incorrect username or password");
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      notify('An error occurred while logging in.');
    }
  }


  function isEmailValid(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }
  async function handleRegister(e) {
    e.preventDefault();
    try {
      const tableName = 'Users';
      if (passwordInput === repeatPasswordInput && isEmailValid(emailInput) && passwordInput.length>=6 && userInput.length>=3) {
        const { data, error } = await supabase
        .from(tableName)
        .insert([{ name: nameInput, last_name: lastNameInput, email: emailInput, user: userInput, password: passwordInput }]);
        if (error) {throw error;}
        notify_ok(nameInput+" register ok");
        console.log(`Se creó una nueva fila para ${nameInput}.`);
      }
      else if(!isEmailValid(emailInput)){notify("Invalid email");}
      else if (passwordInput !== repeatPasswordInput) {notify("Passwords don't match");}
      else if (passwordInput.length<6) {notify("Password must be 6 or more characters");}
      else if (userInput.length<3) {notify("User must be 3 or more characters");}
      else {notify("Invalid data");}
    }
    catch (error) {
      if(error.message!=null){
        if(error.message.includes("Users_email_key")){notify("This email address is already in use");}
        if(error.message.includes("Users_user_key")){notify("This User is already in use");}
        console.error(error.message);
      }
    }
  }
  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Users';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase.from(tableName).select().order('name', { ascending: false }).limit(5);
      if (error) {throw error;}
      console.log('Datos leídos correctamente:', data);
    } catch (error) {
      console.error('Error al leer datos:', error.message);
    }
  }
  /*
  useEffect(() => {
    leerDatos();
  }, []);
  */
  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback(e);
    }
  };
  //añadimos la imagen de perfil local
  const user = {
    name: 'Diego Martínez',
    image: diegomar,
    imageSize: 90,
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">{isRegister ? 'Register' : 'Login'}</h1>
      {isLoggedIn && (
      <button className="boton-login button_normal" onClick={handletoLogin}>
        Logout
      </button>
      )}

      {isLoggedIn && (
        <div className="my-atropos">
          <a
            href="https://www.linkedin.com/in/diegomarbar/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MyCard />
          </a>
        </div>
      )}
      {!isLoggedIn && !isRegister && (
        <form>
          <div className="input-group">
          <input
            required
            type="text"
            name="text"
            autoComplete="off"
            className="input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleLogin)}
          />
          <label className="user-label">User or Email</label>
          </div>
          <div className="input-group">
            <input
              required
              type="password"
              name="text"
              autoComplete="off"
              className="input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleLogin)}
            />
            <label className="user-label">Password</label>
          </div>
          <div>
            <button className='button_normal' onClick={handleRegisterToggle}>Go to Register</button>
            <button className='button_normal' onClick={handleLogin}>{isLoggedIn ? 'Logout' : 'Login'}</button>
          </div>
          
        </form>
      )}
      {!isLoggedIn && isRegister && (
        <form>
          <div className="input-group">
          <input
              required
              type="text"
              name="text"
              autoComplete="off"
              className="input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">Name</label>
          </div>
          <div className="input-group">
          <input
              required
              type="text"
              name="text"
              autoComplete="off"
              className="input"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">Last Name</label>
          </div>
          <div className="input-group">
          <input
              required
              type="text"
              name="text"
              autoComplete="off"
              className="input"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">Email</label>
          </div>
          <div className="input-group">
            <input
              required
              type="text"
              name="text"
              autoComplete="off"
              className="input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">User</label>
          </div>
          <div className="input-group">
            <input
              required
              type="password"
              name="text"
              autoComplete="off"
              className="input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">Password</label>
          </div>
          <div className="input-group">
            <input
              required
              type="password"
              name="text"
              autoComplete="off"
              className="input"
              value={repeatPasswordInput}
              onChange={(e) => setRepearPasswordInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label">Repeat Password</label>
          </div>
          <div>
            <button className='button_normal' onClick={handleRegisterToggle}>
              {isLoggedIn ? 'Logout' : 'Go to Login'}
            </button>
            <button className='button_normal' onClick={handleRegister}>
              {isRegister ? 'Register' : 'Register'}
            </button>
          </div>
        </form>
      )}
      <ToastContainer transition={Flip}/>
      
      {/* <p className="read-the-docs">login: {localStorage.getItem('user_logged')}</p> */}
{/*   <p className="read-the-docs">login: {isLoggedIn.toString()}</p>
      <p className='read-the-docs'>register: {isRegister.toString()}</p> */}
    </>
  );
}

export default Login;
