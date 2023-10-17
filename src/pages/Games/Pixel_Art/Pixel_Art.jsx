import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import Navbar from '../../../components/Navbar/Navbar';
import TOKENS from '../../../../data/constants';
import './Pixel_Art.css';
import { IconHeart, IconHeartFilled, IconBrush, IconHeartCode } from '@tabler/icons-react';

const supabaseUrl = TOKENS.SUPABASE.URL;
const supabaseKey = TOKENS.SUPABASE.KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const colorPalette = [
  '#000000', // Black
  '#FFFFFF', // White
  '#DB4437', // Red
  '#0F9D58', // Green
  '#4285F4', // Blue
  '#F4B400', // Yellow
  '#DA1884', // Magenta
  '#36C5F0', // Cyan
];

const Pixel_Art = () => {
  const [selectedColor, setSelectedColor] = useState('#36C5F0'); // Default color is black
  const [pixels, setPixels] = useState([]);
  const [mundial_pixels, setMundial_pixels] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [hoveredPixel, setHoveredPixel] = useState({ row: -1, col: -1 });
  const [active, setActive] = useState(false)

  useEffect(() => {
    if(localStorage.getItem('playerName') !== null){
      setPlayerName(localStorage.getItem('playerName'));
    }
  }, []);
  // Create an empty 16x16 pixel grid
  async function initializePixels() {
    const initialPixels = new Array(16).fill(null).map(() => new Array(16).fill(['#000000','Diego']));
    setPixels(initialPixels);
    /*
    const tableName = 'Pixel_Art';
    const { data, error } = await supabase
    .from(tableName)
    .update([{pixel_colors: initialPixels }])
    .eq('id', 1)
    .select()
    if (error) {throw error;}
    */
  };

  // Handle pixel click and update the color
  async function handlePixelClick(row, col) {
    const updatedPixels = [...pixels];
    updatedPixels[row][col] = [selectedColor,playerName];
    setPixels(updatedPixels);
    //console.log([pixels]);
    
    const tableName = 'Pixel_Art';
    const { data, error } = await supabase
    .from(tableName)
    .update([{pixel_colors: updatedPixels }])
    .eq('id', 1)
    .select()
    if (error) {throw error;}
  };

  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Pixel_Art';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase
      .from(tableName)
      .select('pixel_colors')
      if (error) {throw error;}
      console.log('Datos leídos correctamente:', data[0].pixel_colors);
      setPixels(data[0].pixel_colors);
    } catch (error) {
      console.error('Error al leer datos:', error.message);
    }
  }
  //Nos subscribimos a la tabla para que nos notifique cuando se haga un cambio 
  //y actualizamos los colores de los pixeles
  useEffect(() => {
    const tableName = 'Pixel_Art';
    const subscription = supabase
      .channel(tableName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
        },
        (payload) => setPixels(payload.new.pixel_colors)
      )
      .subscribe();

    // Limpia la suscripción cuando el componente se desmonta
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initialize the pixel grid when the component mounts
  useEffect(() => {
    // Inicializa la cuadrícula de píxeles cuando el componente se monta
    initializePixels();
    leerDatos();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      localStorage.setItem('playerName', playerName);
    }
  };
  return (
    <div>
      <div><Navbar /></div>
      <h1 className="read-the-docs" style={{ display: 'flex', justifyContent: 'center'}}>
        <span style={{ color: colorPalette[2] }}>P</span>
        <span style={{ color: colorPalette[3] }}>i</span>
        <span style={{ color: colorPalette[4] }}>x</span>
        <span style={{ color: colorPalette[5] }}>e</span>
        <span style={{ color: colorPalette[6] }}>l</span>
        &nbsp;
        <span style={{ color: colorPalette[7] }}>A</span>
        <span style={{ color: colorPalette[2] }}>r</span>
        <span style={{ color: colorPalette[4] }}>t</span>
        &nbsp;
        <IconBrush 
          style={{ marginTop: '0px' }}
          size={51}
          color={colorPalette[6]}
          fill='none'
          stroke={2}
          strokeLinejoin="miter"
        />
      </h1>
      <div className="input-group">
          <input
              required
              type="text"
              name="text"
              autoComplete="off"
              className="input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e)}
            />
            <label className="user-label">Name - Enter to set</label>
          </div>
          <div className="pixel-grid">
            {pixels.map((row, rowIndex) => (
              <div key={rowIndex} className="pixel-row">
                {row.map((pixelData, colIndex) => (
                  <div
                    key={colIndex}
                    className="pixel"
                    style={{ backgroundColor: pixelData[0] }} // Acceso al color
                    onClick={() => handlePixelClick(rowIndex, colIndex)}
                    onMouseEnter={() => setHoveredPixel({ row: rowIndex, col: colIndex })}
                    onMouseLeave={() => setHoveredPixel({ row: -1, col: -1 })}
                  >
                    {hoveredPixel.row === rowIndex && hoveredPixel.col === colIndex && (
                      <span className="hovered-player-name">{pixelData[1]}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
      <div className="color-palette">
        {colorPalette.map((color) => (
          <div
            key={color}
            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default Pixel_Art;
