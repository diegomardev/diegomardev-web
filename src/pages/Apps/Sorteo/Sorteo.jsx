import React, { useState } from 'react';

const App = () => {
  const [username, setUsername] = useState(''); // Estado para el nombre de usuario
  const [userData, setUserData] = useState(null); // Estado para almacenar los datos del usuario

  // Función para manejar el cambio en el input del nombre de usuario
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  // Función para manejar el evento de presionar una tecla en el input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  // Función para obtener los datos del usuario
  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://diegomar.duckdns.org:9819/api/instagram/${username}`,{referrerPolicy: "unsafe-url" });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const userData = await response.json();
      setUserData(userData);
      //console.log(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div className="App">
      <h1>Instagram</h1>
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter Instagram username"
      />
      <button onClick={fetchUserData}>
        Search
      </button>
      {userData && (
        <div>
          <h2>{userData.Name} ({userData.username})</h2>
          <a href={`https://www.instagram.com/${userData.username}/`} target="_blank" rel="noopener noreferrer">
            <img src={userData.imageURL} alt="Profile Picture" />
          </a>
          <p>Followers: {userData.followers}</p>
          <p>Following: {userData.following}</p>
          <p>Posts: {userData.posts}</p>
          <p>Description: {userData.description}</p>
        </div>
      )}
    </div>
  );
};

export default App;
