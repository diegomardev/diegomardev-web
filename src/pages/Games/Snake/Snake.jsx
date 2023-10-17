import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../../../index.css'
import './Snake.css';
import Navbar from '../../../components/Navbar/Navbar'
import confetti from 'canvas-confetti'

// Configura tu conexión a Supabase
const supabaseUrl = "https://dnaxvipqtbtqnzpeoovp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYXh2aXBxdGJ0cW56cGVvb3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY2Njk3MTAsImV4cCI6MjAwMjI0NTcxMH0.a_1fjstV1Q9vU5YXJEcW5ZmIxnRvn0YZsdSblqYgOLM";
const supabase = createClient(supabaseUrl, supabaseKey);

let puntos_iniciales=0;
const initialSnake = [
  { x: 0, y: 10 },
  { x: 0, y: 11 },
  { x: 0, y: 12 },
];
const initialoldSnake = [
  { x: 0, y: 10 },
  { x: 0, y: 11 },
];
const initialFood = { x: 5, y: 5 };

let nuevadireccion="RIGHT";
let direccion="RIGHT";
let setintervalo=170;
let suma_tecla=0;
let oldsnake=initialoldSnake;
let actualsnake=initialoldSnake;
const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

const GRID_SIZE = 20;

const getRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
};

const SnakeGame = () => {
  const [topScores, setTopScores] = useState([]);
  const [playerName, setPlayerName] = useState('Player');
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [tecla_pulsada, setTecla_pulsada] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  //al inicio de la aplicación, se ejecuta la función para leer si hay guardado algun jugador

  useEffect(() => {
    if(localStorage.getItem('playerName') !== null){
      setPlayerName(localStorage.getItem('playerName'));
    }
  }, []);
  // Define la función para leer datos
  async function leerDatos() {
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Top_Score_Snake';

      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase.from(tableName).select().order('column_score', { ascending: false }).limit(5);

      if (error) {
        throw error;
      }

      setTopScores(data);
      console.log('Datos leídos correctamente:', data);
    } catch (error) {
      console.error('Error al leer datos:', error.message);
    }
  }

  useEffect(() => {
    leerDatos();
  }, []);
  async function actualizarPuntuacion(playerName, newScore, level) {
    try {
      const tableName = 'Top_Score_Snake';  
      // Obtén la puntuación actual de Fran desde la base de datos
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
    if (gameOver) {
      handleGameOver(score);
    }
  }, [gameOver]);
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(moveSnake, setintervalo);
      return () => clearInterval(interval);
    }
  }, [snake, isRunning]);
  const handleStart = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection(DIRECTIONS.RIGHT);
    nuevadireccion="RIGHT";
    direccion="RIGHT";
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setIsRunning(true);
    setintervalo = 170;
    const player = topScores.find(item => item.column_name === playerName);
    if(player){
      puntos_iniciales = player.column_score;    
    }
  };

  useEffect(() => {
    if (showDialog) {
      const newName = prompt('Enter a new name:');
      if (newName) {
        setPlayerName(newName);
      }
      setShowDialog(false);
    }
  }, [showDialog]);

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleRestart = () => {
    handleStop();
    handleStart();
  };
  
  const handleTeclado = (tecla) => {
    nuevadireccion=getNewDirection(tecla);
    if (nuevadireccion) {
      setDirection(nuevadireccion);
      moveSnake
      direccion=nuevadireccion;
    }
  };

  const handleGameOver = (score) => {
    // Aquí obtienes la puntuación final del jugador
    const finalScore = score;
    // Muestra un cuadro de diálogo o utiliza alguna otra forma para obtener el nombre del jugador
    // Por ejemplo, si quieres que el jugador ingrese su nombre en una ventana emergente, puedes usar la función prompt()
    // Si no quieres mostrar nada, puedes usar la función alert()
    // Por defecto, el nombre del jugador es "Player"
    // Si el nombre es muy largo, se redondeará a 10 caracteres máximo
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
  const moveSnake = () => {
    if (gameOver){
      return;
    }

    const head = { ...snake[0] };

    switch (direction) {
      case DIRECTIONS.UP:
        head.y--;
        break;
      case DIRECTIONS.DOWN:
        head.y++;
        break;
      case DIRECTIONS.LEFT:
        head.x--;
        break;
      case DIRECTIONS.RIGHT:
        head.x++;
        break;
      default:
        break;
    }

    const newSnake = [head, ...snake.slice(0, -1)];

    if (isCollision(head) || isOutOfBounds(head)) {
      setGameOver(true);
      setIsRunning(false);
    } else {
      if (isFoodCollision(head)) {
        const newFood = getRandomPosition();
        setFood(newFood);
        setSnake((prevSnake) => [head, ...prevSnake]);
        setScore((prevScore) => prevScore + 1);
        if ((score + 1) % 5 === 0) {
          setLevel((prevLevel) => prevLevel + 1);
          if(setintervalo>60){
            setintervalo=setintervalo-15;
          }
        }
        let puntuacion_actual = score + 1;
        //cada vez que comemos una fruta, actualizamos topScores con la puntuación del jugador que está jugando
        if(localStorage.getItem('playerName') !== null){
          actualizarPuntuacion(playerName, puntuacion_actual, level);
        }
        leerDatos();
        console.log("actualizamos puntuacion")
      } else {
        setSnake(newSnake);
      }
      actualsnake=snake;
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
    let head = { ...snake[0] };

      nuevadireccion=getNewDirection(event.keyCode);
      if (nuevadireccion) {
        setDirection(nuevadireccion);
        moveSnake
        direccion=nuevadireccion;
      }
  };

  const getNewDirection = (keyCode) => {
    if (
        (keyCode===38 && direccion!="DOWN") ||
        (keyCode===40 && direccion!="UP") ||
        (keyCode===37 && direccion!="RIGHT") ||
        (keyCode===39 && direccion!="LEFT")
    ) {
        switch (keyCode) {
        case 38: // ArrowUp
            return DIRECTIONS.UP;
        case 40: // ArrowDown
            return DIRECTIONS.DOWN;
        case 37: // ArrowLeft
            return DIRECTIONS.LEFT;
        case 39: // ArrowRight
            return DIRECTIONS.RIGHT;
        default:
            return null;
        }
    }
  };
  const isCollision = (head) => {
    return snake.some((segment, index) => {
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  };

  const isOutOfBounds = (head) => {
    return (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    );
  };

  const isFoodCollision = (head) => {
    return head.x === food.x && head.y === food.y;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    console.log("Direction actualizada: " + direction);
  }, [direction]);
 
  return (
    <div>
    <div>
      <Navbar/>
    </div>
      <h1 className="read-the-docs snake-h1">Snake Game</h1>
      <div className="game-info">
        <div>Score: {score}</div>
        <div className="game-player">
          <span className="player-name" onClick={() => setShowDialog(true)}>{playerName}</span>
          <span className="hover-text">Change Player</span>
        </div>
        <div>Level: {level}</div>
      </div>
      <div className="game-board" tabIndex={0}>
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
          <div className="game-over">Game Over</div>
        ) : (
          <>
            {snake.map((segment, index) => (
                <div
                    key={index}
                    className={index === 0 ? (
                        direction === "UP" ? "snake-head-up": 
                        direction === "DOWN" ? "snake-head-down" : 
                        direction === "LEFT" ? "snake-head-left" : "snake-head-right") 
                        :  
                        index === snake.length - 1 ? "snake-tail" 
                        :
                        "snake-segment"}
                    style={{
                    top: `${segment.y * 19}px`,
                    left: `${segment.x * 19}px`,
                    }}
                />
            ))}
            
            <div
              className="food"
              style={{
                top: `${food.y * 19}px`,
                left: `${food.x * 19}px`,
              }}
            />
          </>
        )}
      </div>
      <div className="game-controls">
        {!isRunning ? (
          <button className='botones_juegos_start' onClick={handleStart}>Start</button>
        ) : (
          <button className='botones_juegos_start' onClick={handleStop}>Stop</button>
        )}
        <button className='botones_juegos_start' onClick={handleRestart}>Restart</button>
      </div>
      <div>
        <button className='botones_juegos_direcion' onClick={() => handleTeclado(38)}>⬆️</button>
      </div>
      <div>
        <button className='botones_juegos_direcion' onClick={() => handleTeclado(37)}>⬅️</button>
        <button className='botones_juegos_direcion' onClick={() => handleTeclado(40)}>⬇️</button>
        <button className='botones_juegos_direcion' onClick={() => handleTeclado(39)}>➡️</button>
      </div>
      {/* <div>Direccion: {direccion}</div> */}
      {/* <div>NUEVA Direccion: {nuevadireccion}</div> */}
      
    </div>
  );
};

export default SnakeGame;
