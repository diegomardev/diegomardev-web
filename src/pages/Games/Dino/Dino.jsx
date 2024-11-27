import Navbar from '../../../components/Navbar/Navbar';
import React, { useEffect, useRef, useState } from 'react';
import ChromeDinoGame from 'react-chrome-dino';
import { createClient } from '@supabase/supabase-js';
import TOKENS from '../../../../data/constants';
import './Dino.css';
// Configura tu conexión a Supabase
//console.log(TOKENS_SUPABASE)
const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DinoGame = () => {
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([]);
  const [playerName, setPlayerName] = useState('Player');
  const dinoRef = useRef(null);

  useEffect(() => {
    const initializeGame = () => {
      const runnerContainer = dinoRef.current?.querySelector('.runner-container');
      if (!runnerContainer) return setTimeout(initializeGame, 500);
  
      const script = document.createElement('script');
      script.innerHTML = `
        if (!Runner.prototype._gameOverWrapped) {
          const originalGameOver = Runner.prototype.gameOver;
          Runner.prototype.gameOver = function() {
            setTimeout(() => {
              window.parent.postMessage(
                { type: 'GAME_OVER', score: this.distanceMeter.digits.join('') },
                '*'
              );
            }, 100); // Esperar 0,1 segundo antes de enviar la puntuación
            originalGameOver.call(this);
          };
          Runner.prototype._gameOverWrapped = true;
        }
      `;
      runnerContainer.appendChild(script);
    };
  
    const handleMessage = (event) => {
      if (event.data?.type === 'GAME_OVER') {
        setScore(parseInt(event.data.score, 10));
      }
    };
  
    window.addEventListener('message', handleMessage);
    initializeGame();
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  useEffect(() => {
    if(localStorage.getItem('user_logged') !== null){
      setPlayerName(localStorage.getItem('user_logged'));
    }
    else if(localStorage.getItem('playerName') !== null){
      setPlayerName(localStorage.getItem('playerName'));
    }
    leerDatos();
  }, []);
  useEffect(() => {
    //console.log('Puntuación:', score);
    actualizarPuntuacion(playerName,score);
  }, [score]);

  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Top_Score_Dino';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase.from(tableName).select().order('column_score', { ascending: false }).limit(10);
      if (error) {throw error;}
      setTopScores(data);
      //console.log('Datos leídos correctamente:', data);
    } catch (error) {
      //console.error('Error al leer datos:', error.message);
    }
  }
  async function actualizarPuntuacion(playerName, newScore) {
    try {
      const tableName = 'Top_Score_Dino';
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
            .update({ column_score: newScore})
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
          { column_name: playerName, column_score: newScore}
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
  return (
    <div style={{maxWidth: '100%', width: '100%', margin: '0 auto' }}>
      <Navbar />
      <h1 className="read-the-docs">Dino Game</h1>
      <div ref={dinoRef}>
        <ChromeDinoGame />
      </div>
      <h2>Final Score: {score}</h2>
      <div>
        <table className="styled-table-dino">
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
    </div>
  );
};

export default DinoGame;
