import React, { useState, useEffect } from 'react';
import '../../../index.css';
import './Twitch_Chat.css';
import Navbar from '../../../components/Navbar/Navbar';
import tmi from 'tmi.js';
import TOKENS from '../../../../data/constants';

const clinetId     = TOKENS.TWITCH.CLIENTID;
const clinetSecret = TOKENS.TWITCH.CLIENTSECRET;
const access_token = TOKENS.TWITCH.ACCESS_TOKEN;
////COMANDO PARA ACTUALIZAR ACCESS TOKEN DE TWITCH PONERLO EN CONSOLA DE LINUX
/*
curl -X POST 'https://id.twitch.tv/oauth2/token' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'client_id=aka4k24mhpcytuvvmayu24mvi7bxfs&client_secret=gvag9nognolg07bswj3659lonqg4fz&grant_type=client_credentials'
*/

function mayusPrimeraLetra(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTwitchAuthorization() {
  let url = "https://id.twitch.tv/oauth2/token?client_id="+clinetId+"&client_secret="+clinetSecret+"&grant_type=client_credentials";
  fetch(url, {
  method: "POST",
  })
  .then((res) => res.json())
  .then((data) => handleAuthorization(data));
  return handleAuthorization(data);
}

function handleAuthorization(data) {
  let { access_token, expires_in, token_type } = data;
  console.log((`${token_type} ${access_token} ${expires_in}`))
  return access_token;
}

function Twitch_Chat() {
  const [count, setCount] = useState(0);
  const [confettiCount, setConfettiCount] = useState(0);
  const [url, setUrl] = useState('https://www.twitch.tv/kidi');
  const [channelName, setChannelName] = useState('kidi');
  const [cambiochannelName, setCambiochannelName] = useState('kidi');
  const [colormessagechannel, setColormessagechannel] = useState('red');
  const [messages, setMessages] = useState(['','','','','','','','','','']);
  const [viewers, setViewers] = useState(0);
  const [imageDirect, setImageDirect] = useState('');
  
  async function getStreams(sitio,canal) {
    const endpoint = "https://api.twitch.tv/helix/streams?user_login="+canal;
  
    //DEJAR ESTA OPCION PARA PODER RECUPERAR EL ACCESS_TOKEN se mostrará en console de la pagina.
    //let authorization = "Bearer "+ getTwitchAuthorization(); 
    let authorization = "Bearer " + access_token;

    let headers = {
    "Authorization": authorization,
    "Client-Id": clinetId,
    };
    const response = await fetch(endpoint, {headers});
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.data.length > 0) {
        console.log(data.data[0]);
        const viewers = data.data[0].viewer_count;
        const width = 300;
        const height = 169;
        //const image_direct=data.data[0].thumbnail_url
        const image_direct = data.data[0].thumbnail_url.replace("{width}", width).replace("{height}", height);
        //thumbnail_url: "https://static-cdn.jtvnw.net/previews-ttv/live_user_el_yuste-{width}x{height}.jpg"
        setViewers(viewers);
        setImageDirect(image_direct);
        //console.log(sitio+" "+viewers+" espectadores")
      } else {
        setViewers("No directo");//No está en directo
        //console.log(sitio+" No directo 0 espectadores")
      }
    } else {
      throw new Error("Error al obtener los datos del canal de Twitch.");
    }
  }
  const rotateMessages = (newMessage, displayName, color, date, subscriber, mod) => {
    if(color === undefined || color === null){
      color = 'violet';
    }
    let suscriptor="";
    if(subscriber){
      suscriptor = "💰";
    }
    let moderador="";
    if(mod){
      moderador="🤺";
    }
    setMessages((prevMessages) => {
      const updatedMessages = [
        {
          message: newMessage,
          displayName: displayName,
          color: color,
          date: date,
          subscriber: suscriptor,
          mod: moderador
        },
        ...prevMessages.slice(0, 9)
      ];
      return updatedMessages;
    });
    //getStreams("nuevo_mensaje",localStorage.getItem('channelName'));
  };

  const handleMessage = (channel, tags, message, self) => {
    // Ignora los mensajes enviados por el propio bot
    if (self) return;

    setCount((prevCount) => (prevCount >= 9 ? 0 : prevCount));
    const date = new Date();
    const hour = date.getHours();
    let min = date.getMinutes();
    if(min < 10){min="0"+min}
    const sec = date.getSeconds();
    rotateMessages(message, (" "+tags['display-name']+": "), tags.color, (hour+":"+min+" "), tags.subscriber, tags.mod);
    if(tags.color === undefined || tags.color === null){
      tags.color = 'violet';
    };
    setColormessagechannel(tags.color);
    //console.log(tags);
  };

  useEffect(() => {
    getStreams("change_streamer",localStorage.getItem('channelName'));
    const client = new tmi.Client({
      channels: [channelName]
    });
    client.connect();
    client.on('message', handleMessage);

    return () => {
      client.off('message',handleMessage);
      client.disconnect();
    };
  }, [channelName]);
  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback();
    }
  };
  const changeURL = () => {
    let newChannelName = url.toLowerCase();
    setUrl(newChannelName);
    newChannelName = newChannelName.replace(/^https:\/\/www.twitch.tv\//, '');
    setChannelName(newChannelName);
    setCambiochannelName(newChannelName);
    localStorage.setItem('channelName', newChannelName);
  };
  const changeChannel = () => {
    setCambiochannelName(cambiochannelName.toLowerCase());
    setChannelName(cambiochannelName.toLowerCase());
    setUrl("https://www.twitch.tv/"+cambiochannelName.toLowerCase())
    localStorage.setItem('channelName', cambiochannelName.toLowerCase());
  };

  useEffect(() => {
    if(localStorage.getItem('channelName') !== null){
      setChannelName(localStorage.getItem('channelName'));
      setCambiochannelName(localStorage.getItem('channelName'));
      setUrl("https://www.twitch.tv/"+localStorage.getItem('channelName'));
    }
    else{localStorage.setItem('channelName', channelName);}
    const timer = setInterval(() => {
      getStreams("setinterval_inicial",localStorage.getItem('channelName'))
    }, 5000);
    return () => {
      clearInterval(timer); // Limpia el temporizador si el componente se desmonta antes de que se cumpla el tiempo
    };
  }, []);

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs twitch-tittle">Twitch Chat</h1>
      <div className='alinear'>
        {/* <label style={{ marginRight: '5px' }} htmlFor="urlInput">URL de Twitch </label> */}
        <input
          className="input_twitch"
          id="urlInput"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, changeURL)}
        />
        <button className="botones botones_twitch button_normal" onClick={changeURL}>Change URL</button>
      </div>
      <div className='alinear'>
        {/* <label style={{ marginRight: '5px' }} htmlFor="channelInput">Canal de Twitch </label> */}
        <input
          className="input_twitch"
          id="channelInput"
          type="text"
          value={cambiochannelName}
          onChange={(e) => setCambiochannelName(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, changeChannel)}
        />
        <button className="botones botones_twitch button_normal" onClick={changeChannel}>Change Channel</button>
      </div>
      {viewers !== "No directo" ? (
        <img className='twitch-image' src={imageDirect} alt="Thumbnail" onClick={() => window.open(url, '_blank')}/>
      ) : null}
      <div className="channelname alinear" onClick={() => window.open(url, '_blank')}>
        {mayusPrimeraLetra(channelName)} Chat ({viewers})
      </div>
      <div className="chat">
        {messages.map((message, index) => (
          <p key={index} className="message">
            <span style={{ color: 'grey' }}>
              {message.date}
            </span>
            <span>
              {message.mod}
            </span>
            <span>
              {message.subscriber}
            </span>
            <span style={{ color: message.color }}>
              {message.displayName}
            </span >
            <span>
              {message.message}
            </span>
          </p>
        ))}
      </div>
      <p className="read-the-docs" style={{ marginTop: '0px' }}>
      ⬆️Mesagges⬆️
      </p>
    </>
  );
}

export default Twitch_Chat;
