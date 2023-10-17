import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Tetris.css';
import Navbar from '../../../components/Navbar/Navbar';

// Tamaño de tetris 10x20
const ROWS = 20;
const COLUMNS = 10;

const Tetris = () => {
  // Define las formas de las piezas de Tetris
  const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], 
     [1, 1]],       // O
    [[1, 1, 1], 
     [0, 1, 0]],    // T
    [[1, 1, 1], 
     [1, 0, 0]],    // L
    [[1, 1, 1], 
     [0, 0, 1]],    // J
    [[1, 1, 0], 
     [0, 1, 1]],    // S
    [[0, 1, 1], 
     [1, 1, 0]],    // Z
  ];

  // Función para generar una nueva pieza de Tetris aleatoriamente
  const generateRandomPiece = () => {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[randomIndex];
    const col = Math.floor((COLUMNS - shape[0].length) / 2);
    return { shape, row: 0, col };
  };

  const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const [currentPiece, setCurrentPiece] = useState({ shape: SHAPES[0], row: 0, col: 3 });

  // Función para verificar si una posición es válida para la pieza actual
// Función para verificar si una posición es válida para la pieza actual
const isPositionValid = (rowOffset, colOffset) => {
  const { shape, row, col } = currentPiece;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newRow = row + y + rowOffset;
        const newCol = col + x + colOffset;

        if (
          newRow < 0 ||
          newRow >= ROWS ||
          newCol < 0 ||
          newCol >= COLUMNS
        ) {
          return false;
        }
      }
    }
  }

  return true;
};


  const showpiece = () => {
    const newBoard = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

    // Colocar la pieza en su nueva posición
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const newRow = currentPiece.row + y;
          const newCol = currentPiece.col + x;
          newBoard[newRow][newCol] = 1;
        }
      });
    });

    setBoard(newBoard);
  };

  // Función para mover la pieza hacia abajo
  const moveDown = () => {
    if (isPositionValid(1, 0)) {
      setCurrentPiece((prevPiece) => ({ ...prevPiece, row: prevPiece.row + 1 }));
      showpiece();
    } else {
      // Fijar la pieza en su posición actual
      placePiece();
    }
  };

  // Función para fijar la pieza en su posición actual y limpiar filas completas
  const placePiece = () => {
    const newBoard = [...board];

    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const newRow = currentPiece.row + y;
          const newCol = currentPiece.col + x;
          newBoard[newRow][newCol] = 1;
        }
      });
    });

    setBoard(newBoard);

    // Generar una nueva pieza
    setCurrentPiece(generateRandomPiece());
  };

  const start = () => {
    placePiece();
  };

  const stop = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  };

  // Función para mover la pieza en la dirección especificada
  const movePiece = (rowOffset, colOffset) => {
    if (isPositionValid(rowOffset, colOffset)) {
      setCurrentPiece((prevPiece) => ({
        ...prevPiece,
        row: prevPiece.row + rowOffset,
        col: prevPiece.col + colOffset,
      }));
      showpiece();
    }
  };
  // Función para manejar eventos de teclado
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      movePiece(0, -1); // Mover hacia la izquierda
    } else if (event.key === 'ArrowRight') {
      movePiece(0, 1); // Mover hacia la derecha
    } else if (event.key === 'ArrowDown') {
      moveDown();
    } else if (event.key === 'ArrowUp') {
      // Rotar la pieza
      const rotatedPiece = {
        ...currentPiece,
        shape: currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i])).reverse(),
      };

      if (isPositionValid(0, 0, rotatedPiece)) {
        setCurrentPiece(rotatedPiece);
      }
      showpiece();
    }
  }, [currentPiece]);

  // Manejar eventos de teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Renderizar el tablero de juego
  const renderBoard = useMemo(() => {
    return board.map((row, rowIndex) => (
      <div className="row" key={rowIndex}>
        {row.map((cell, colIndex) => (
          <div className={`cell ${cell ? 'filled' : ''}`} key={colIndex}></div>
        ))}
      </div>
    ));
  }, [board]);

  return (
    <div>
      <div>
        <Navbar/>
      </div>
      <h1 className="read-the-docs">Tetris</h1>
      <div className="tetris">
        <div className="game-board-tetris">{renderBoard}</div>
      </div>
      <div>
        <button onClick={start}>
          start
        </button>
        <button onClick={stop}>
          stop
        </button>
      </div>
    </div>
  );
};

export default Tetris;
