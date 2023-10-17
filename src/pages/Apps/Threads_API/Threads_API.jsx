import React, { useState, useEffect } from 'react';
import '../../../index.css';
import './Threads_API.css';
import Navbar from '../../../components/Navbar/Navbar';
import tmi from 'tmi.js';
import TOKENS from '../../../../data/constants';

function Threads_API() {
  const [url, setUrl] = useState('https://www.twitch.tv/kidi');
  const [channelName, setChannelName] = useState('kidi');
  const [cambiochannelName, setCambiochannelName] = useState('kidi');
  const [messages, setMessages] = useState(['','','','','','','','','','']);
  const [viewers, setViewers] = useState(0);
  const [userName, setUserName] = useState('midu.dev');

async function fetchData() {
  const fetchUserIdByName = async ({ userName }) => {
    console.log(`https://www.threads.net/@${userName}`);

    const response = await fetch(`https://www.threads.net/@${userName}`, {
      headers: { 'sec-fetch-site': 'same-site' },
    });

    const html = await response.text();
    const userId = html.match(/"user_id":"(\d+)"/)?.[1];
    return userId;
  };

  // Llamada a la función fetchUserIdByName para obtener el userId
  const userId = await fetchUserIdByName({ userName: 'midu.dev' });
  console.log(userId);
}

// Llamada a la función fetchData
fetchData();

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Threads API</h1>
      <div className='alinear'>
        <label style={{ marginRight: '5px' }} htmlFor="urlInput">Threads API </label>
      </div>
      <p className="read-the-docs">
        Mesagges
      </p>
    </>
  );
}

export default Threads_API;
