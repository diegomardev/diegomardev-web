import React, { useState, useEffect } from 'react';
import diegomar from '../../assets/users/diegomar.jpg';
import userpng from '../../assets/users/user.png';
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

  const [borderImageColor, setBorderImageColor] = useState('#000000');
  const [showImageBorder, setShowImageBorder] = useState(true);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [showShadow, setShowShadow] = useState(true);
  //añadimos la imagen de perfil local
  const [user, setUser] = useState({
    id: '2015',
    name: 'Diego',
    lastName: 'Martínez',
    image: userpng,
    imageSize: 200,
    user: 'diego',
  });
  const [imageUrl, setImageUrl] = useState(null);

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
    localStorage.removeItem('user_logged');
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
          localStorage.setItem('user_logged', data.user);
          if (data.profile_image) {
            fetchImage(data);
          }
          else{
            const { name, last_name, id, user } = data; // Obtener los datos del usuario
            //console.log(id)
            const newUser = {
              name: name,
              lastName: last_name,
              id: id,
              image: userpng,
              imageSize: user.imageSize,
              user: data.user,
            };
          setUser(newUser); // Almacenar los datos del usuario en el estado
          }
          setIsLoggedIn(true);
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
        //console.log(`Se creó una nueva fila para ${nameInput}.`);
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
        //console.error(error.message);
      }
    }
  }
  async function handleImageBorder(e) {
    e.preventDefault();
    const user_logged = localStorage.getItem('user_logged');
    try {
      const tableName = 'Users';
        const { data, error } = await supabase
        .from(tableName)
        .update([{show_image_border: showImageBorder, color_image_border: borderImageColor}])
        .eq('user', user_logged);
        if (error) {throw error;}
        notify_ok("updating the image border ok");
    }
    catch (error) {
      console.error(error.message);
      
      notify("Error updating the image border");
    }
  }
  async function handleImageShadow(e) {
    e.preventDefault();
    const user_logged = localStorage.getItem('user_logged');
    try {
      const tableName = 'Users';
        const { data, error } = await supabase
        .from(tableName)
        .update([{show_image_shadow: showShadow, color_image_shadow: shadowColor}])
        .eq('user', user_logged);
        if (error) {throw error;}
        notify_ok("updating the image shadow ok");
    }
    catch (error) {
      console.error(error.message);
      
      notify("Error updating the image shadow");
    }
  }
  const fetchImage = async (datas) => {
    try {
      const user_logged = localStorage.getItem('user_logged');
      const directoryPath = `${user_logged}/`;
      //console.log(directoryPath);
  
      // Obtener la lista de archivos en el directorio
      const { data: filesData, error: filesError } = await supabase.storage.from('Users').list(directoryPath);
  
      if (filesError) {
        console.error('Error al obtener la lista de archivos:', filesError.message);
        return;
      }
      //console.log(filesData);
      // Seleccionar el primer archivo de la lista (puedes ajustar esto según tus necesidades)
      const firstFile = filesData?.[0];
      if (firstFile) {
        // Obtener la URL firmada para el archivo seleccionado
        const filePath = `${directoryPath}${firstFile.name}`;
        const { data, error } = await supabase.storage.from('Users').createSignedUrl(filePath, 60);
        //console.log(data);
        if (error) {
          console.error('Error al obtener la URL firmada:', error.message);
        } else {
          if (datas) {
            const { name, last_name, id, show_image_border, color_image_border, show_image_shadow, color_image_shadow} = datas; // Obtener los datos del usuario
            //console.log(id)
            const newUser = {
              name: name,
              lastName: last_name,
              id: id,
              image: data.signedUrl,
              imageSize: user.imageSize,
            };
            setUser(newUser); // Almacenar los datos del usuario en el estado
            setShowImageBorder(show_image_border);
            setBorderImageColor(color_image_border);
            setShowShadow(show_image_shadow);
            setShadowColor(color_image_shadow); 
            setIsLoggedIn(true);
            
          } else {
            notify('Please insert username and password');
          }
        }
      } else {
        console.warn('No se encontraron archivos en el directorio.');
      }
    } catch (error) {
      console.error('Error en fetchImage:', error.message);
    }
  };
  //Función para validar el usuario y la contraseña
  async function save_login_user(user_logged) {
    
    try {
      const tableName = 'Users';
      const { data, error } = await supabase
        .from(tableName)
        .select()
        .or(`user.eq.${user_logged},email.eq.${user_logged}`)
        .single(); // Solo esperamos un resultado
      if (error) {
        notify('Please insert username and password');
        return;
      }
      //console.log(data);
      //si ese usuario tiene imagen llamamos a la función fetch para coger la imagen de la base de datos
      if (data.profile_image) {
        fetchImage(data);
      }
      else{
        const { name, last_name, id, show_image_border, color_image_border, show_image_shadow, color_image_shadow} = data; // Obtener los datos del usuario
        //console.log(id)
        const newUser = {
          name: name,
          lastName: last_name,
          id: id,
          image: userpng,
          imageSize: user.imageSize,
        };
        setUser(newUser); // Almacenar los datos del usuario en el estado
        setShowImageBorder(show_image_border);
        setBorderImageColor(color_image_border);
        setShowShadow(show_image_shadow);
        setColorShadow(color_image_shadow); 
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      notify('An error occurred while logging in.');
    }
  }
  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Users';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase.from(tableName).select().order('name', { ascending: false }).limit(5);
      if (error) {throw error;}
      //console.log('Datos leídos correctamente:', data);
    } catch (error) {
      console.error('Error al leer datos:', error.message);
    }
  }
  /*
  useEffect(() => {
    leerDatos();
  }, [isLoggedIn]);
  */
  
  const handleToggleImageBorder = () => {
    setShowImageBorder(!showImageBorder);
  };
  const handleToggleShadow = () => {
    setShowShadow(!showShadow);
  };
  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback(e);
    }
  };

  useEffect(() => {
    if(localStorage.getItem('user_logged') !== (null)){
      save_login_user(localStorage.getItem('user_logged'));
    }
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };
  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  };
  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Selecciona una imagen antes de subirla.');
      return;
    }
    const user_logged = localStorage.getItem('user_logged');
    const filePath = `${user_logged}/profile_image`; // Define la ruta en la que quieres almacenar la imagen en Supabase Storage
    const fileExtension = getFileExtension(selectedImage.name);
    //console.log(filePath);
    //console.log(fileExtension);
    
    // Sube la imagen a Supabase Storage
    const { data, error } = await supabase.storage.from('Users').upload(`${filePath}`, selectedImage);
    //const { datas, errors } = await supabase.storage.from('Users').update(`${filePath}`, selectedImage);
    
    if (error) {
      const { datas, errors } = await supabase.storage.from('Users').update(`${filePath}`, selectedImage);
      if (errors) {
        console.error('Error al subir la imagen:', errors.message);
      } else {
        notify_ok("Update Image to "+user_logged);
        //console.log('Imagen actualizada correctamente:', datas);
        save_login_user(user_logged)
      }
    } else {
      const tableName = 'Users';
      const { data, error } = await supabase
        .from(tableName)
        .update({profile_image: true})
        .eq('user',user_logged)
        if (error) {
          console.log(error)
          throw error;
        }
        else{
          notify_ok("Upload Image to "+user_logged);
          //console.log('Imagen subida correctamente:', data);
          save_login_user(user_logged)
        }
    }    
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">{isRegister ? "Register" : "Login"}</h1>
      {isLoggedIn && (
        <div>
          <button className="boton-login button_normal" onClick={handletoLogin}>
            Logout
          </button>
          <MyCard
            name={user.name}
            lastname={user.lastName}
            image={user.image}
            id={user.id}
            imageSize={user.imageSize}
            showImageBorder={showImageBorder}
            borderImageColor={borderImageColor}
            showShadow={showShadow}
            shadowColor={shadowColor}
          />
          <h2 style={{marginBottom:"0px"}}>Edit profile</h2>
          <div style={{maxWidth: "390px", margin:"auto"}}>
            <div className="center-div">
              <input
                type="file"
                id="image_uploads"
                name="image_uploads"
                onChange={handleImageChange}
                accept="image/*"
                className="input_image"
              />
              <button onClick={handleUpload} className="button_normal" style={{width:'146px'}}>
                Change image
              </button>
            </div>
            <div className="center-div">
              <h4 style={{marginRight: "8px"}}>Border color</h4>
              <input
                type="color"
                value={borderImageColor}
                onChange={(e) => setBorderImageColor(e.target.value)}
              />
              <input type="checkbox" checked={showImageBorder} onChange={handleToggleImageBorder} style={{marginRight: "17px"}} />
              <button className="button_normal" style={{width:'146px', padding:'0.6em 0.5em'}} onClick={handleImageBorder}>Save Border Img</button>
            </div>
            <div className="center-div">
              <h4 style={{marginRight: "8px"}}>Shadow color</h4>
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
              />
              <input type="checkbox" checked={showShadow} onChange={handleToggleShadow} style={{marginRight: "17px"}} />
              <button className="button_normal" style={{width:'146px', padding:'0.6em 0.5em'}} onClick={handleImageShadow}>Save Shadow Img</button>
            </div>
          </div>
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
            <button className="button_normal" onClick={handleRegisterToggle}>
              Go to Register
            </button>
            <button className="button_normal" onClick={handleLogin}>
              {isLoggedIn ? "Logout" : "Login"}
            </button>
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
            <button className="button_normal" onClick={handleRegisterToggle}>
              {isLoggedIn ? "Logout" : "Go to Login"}
            </button>
            <button className="button_normal" onClick={handleRegister}>
              {isRegister ? "Register" : "Register"}
            </button>
          </div>
        </form>
      )}
      {/* <img src={imageUrl} alt="Imagen Descargada" /> */}
      <ToastContainer transition={Flip} />

      {/* <p className="read-the-docs">login: {localStorage.getItem('user_logged')}</p> */}
      {/*   <p className="read-the-docs">login: {isLoggedIn.toString()}</p>
      <p className='read-the-docs'>register: {isRegister.toString()}</p> */}
    </>
  );
}

export default Login;
