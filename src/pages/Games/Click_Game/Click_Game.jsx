import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../../../index.css'
import './Click_Game.css';
import Navbar from '../../../components/Navbar/Navbar'
import confetti from 'canvas-confetti'
import TOKENS from '../../../../data/constants';
// Configura tu conexión a Supabase
//console.log(TOKENS_SUPABASE)
const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let puntos_iniciales=0;
let setintervalo=170;

const ClickGame = () => {
  const [topScores, setTopScores] = useState([]);
  const [playerName, setPlayerName] = useState('Player');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(5); // Cuenta regresiva en segundos
  const [isRestarting, setIsRestarting] = useState(false); // Estado para controlar el reinicio del juego
  //al inicio de la aplicación, se ejecuta la función para leer si hay guardado algun jugador

  useEffect(() => {
    if(localStorage.getItem('user_logged') !== null){
      setPlayerName(localStorage.getItem('user_logged'));
    }
    else if(localStorage.getItem('playerName') !== null){
      setPlayerName(localStorage.getItem('playerName'));
    }
  }, []);

  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Top_Score_Click';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase.from(tableName).select().order('column_score', { ascending: false }).limit(5);
      if (error) {throw error;}
      setTopScores(data);
      console.log('Datos leídos correctamente:', data);
    } catch (error) {
      console.error('Error al leer datos:', error.message);
    }
  }

  async function actualizarPuntuacion(playerName, newScore, level) {
    try {
      const tableName = 'Top_Score_Click';
      const { data: playerData, error: playerError } = await supabase
        .from(tableName)
        .select('column_score')
        .eq('column_name', playerName)
        .single();
      if (playerData) {
        // Si la fila existe, actualiza la puntuación si es mayor
        const currentScore = playerData.column_score;
        if (newScore > currentScore) {
          const { data, error } = await supabase
            .from(tableName)
            .update({ column_score: newScore , column_level: level})
            .eq('column_name', playerName);
          if (error) {
            throw error;
          }
          console.log(`La puntuación de ${playerName}(${newScore}) se actualizó correctamente.`);
          leerDatos();
        } else {
          console.log(`La puntuación actual de ${playerName}(${currentScore}) es igual o mayor que la nueva puntuación(${newScore}).`);
        }
      } else {
        // Si la fila no existe, crea una nueva fila con el nombre y puntuación
        const { data, error } = await supabase.from(tableName).insert([
          { column_name: playerName, column_score: newScore, column_level: level }
        ]);
  
        if (error) {
          throw error;
        }
        console.log(`Se creó una nueva fila para ${playerName} con la puntuación ${newScore}.`);
        leerDatos();
      }
    } catch (error) {
      console.error('Error al actualizar la puntuación:', error.message);
    }
  }

  useEffect(() => {
    leerDatos();
  }, []);

  useEffect(() => {
    if (gameOver) {
      handleGameOver(score);
    }
  }, [gameOver]);

  const handleStart = () => {
    if (isRestarting) {return;} // Si se está reiniciando, no permitir iniciar nuevamente
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setIsRunning(true);
    setCountdown(5); // Reinicia la cuenta regresiva a 10 segundos

    // Ejecuta la cuenta regresiva
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        const updatedCountdown = Number((prevCountdown - 0.1).toFixed(1));
        if (updatedCountdown <= 0) {
          clearInterval(timer);
          setIsRunning(false);
          setGameOver(true);

          // Agregar retardo antes de permitir reiniciar el juego
          setIsRestarting(true);
          setTimeout(() => {
            setIsRestarting(false);
          }, 2000); // Retardo de 2 segundos (ajusta según tus necesidades)
        }
        return updatedCountdown;
      });
    }, 100);
    const player = topScores.find(item => item.column_name === playerName);
    if (player) {
      puntos_iniciales = player.column_score;
    }
  };

  useEffect(() => {
    if (showDialog) {
      const newName = prompt('Enter a new name:');
      if (newName) {
        setPlayerName(newName);
        localStorage.setItem('playerName', newName);
      }
      setShowDialog(false);
    }
  }, [showDialog]);

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleGameOver = (score) => {
    const finalScore = score;
    let playerName = 'Player'
    if(localStorage.getItem('playerName') !== null){
      playerName = localStorage.getItem('playerName');
      if(finalScore > puntos_iniciales){
        confetti();
      }
      actualizarPuntuacion(playerName, finalScore, level);
      setPlayerName(playerName);
    }
    else{
      confetti();
      playerName = prompt('Ingresa tu nombre(max 10 caracteres):');
      if(playerName === null){
        playerName = "Player"
        alert("Tu puntuación se guardará como: " + playerName)
      }
      if(playerName.length > 10){
        playerName = playerName.substring(0,10);
        alert("Tu puntuación se guardará como: " + playerName)
      }
      if(playerName.length < 1){
        playerName = "Player"
        alert("Tu puntuación se guardará como: " + playerName)
      }
      if(playerName.length <= 10){
        // Llama a la función para actualizar la puntuación
        actualizarPuntuacion(playerName, finalScore, level);
        localStorage.setItem('playerName', playerName);
        setPlayerName(playerName);
      }
    }
  };
  const handleKeyDown = (event) => {
    //si pulsamos espacio paramos y iniciamos.
    if ( event.keyCode === 32) {
      if (isRunning) {
        handleStop();
      } else {
        handleStart();
      }
    }
  };
  const handleMouseClick = (event) => {
    if (event.button === 0) {
      if (!isRunning) {
        handleStart();
      }
      else{
        setScore(score + 1);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
    <div>
      <Navbar/>
    </div>
      <h1 className="read-the-docs">Click Game</h1>
      <div className="game-info">
        <div>Clicks: {score}</div>
        <div className="game-player">
          <span className="player-name" onClick={() => setShowDialog(true)}>{playerName.charAt(0).toUpperCase()+playerName.slice(1)}</span>
          <span className="hover-text">Change Player</span>
        </div>
        <div>Level: {level}</div>
      </div>
      <div className="game-board" tabIndex={0} onClick={handleMouseClick}>
        <div className='tables-container' style={{ position: 'absolute', top: '2px', right: '5px' }}>
          <table>
            <thead>
              <tr>
                <th>Top Player</th>
                <th>Scores</th>
              </tr>
            </thead>
            <tbody>
              {topScores.map((score, index) => (
                <tr key={index}>
                  <td>{score.column_name}</td>
                  <td>{score.column_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {gameOver ? (
          <div>
            <div className="game-over">Game Over</div>
            {isRestarting ? <></>:(<div className="game-over-restart">Click to Restart</div>)}
          </div>
        ):(
          <div>
            {isRunning ? <></>:(<div className="game-over">Click to Start</div>)}
            <div className="game-over">{countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClickGame;
