import React, { useState, useEffect } from 'react';
import { pixelArtSupabase as supabase } from '../../../lib/pixelArtSession';
import PixelArtGallery from './PixelArtGallery';
import Navbar from '../../../components/Navbar/Navbar';
import './Pixel_Art.css';
import { IconBrush } from '@tabler/icons-react';


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
  const [selectedColor, setSelectedColor] = useState('#36C5F0');
  const [pixels, setPixels] = useState(() => Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => ['#000000', ''])));
  const [playerName, setPlayerName] = useState('');
  const [hoveredPixel, setHoveredPixel] = useState({ row: -1, col: -1 });
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [canvasError, setCanvasError] = useState('');

  useEffect(() => {
    if(localStorage.getItem('user_logged') !== null){
      setPlayerName(localStorage.getItem('user_logged'));
    }
    else if(localStorage.getItem('playerName') !== null){
      setPlayerName(localStorage.getItem('playerName'));
    }
  }, []);
  // Handle pixel click and update the color
  async function handlePixelClick(row, col) {
    if (!ready || pending) return;
    const updatedPixels = pixels.map(column => column.map(pixel => [...pixel]));
    updatedPixels[row][col] = [selectedColor, playerName];
    setPixels(updatedPixels);
    setPending(true);
    setCanvasError('');
    try {
      const { data, error } = await supabase.from('Pixel_Art')
        .update({ pixel_colors: updatedPixels }).eq('id', 1).select('id');
      if (error || !data?.length) throw error || new Error('Canvas update rejected');
    } catch {
      await leerDatos();
      setCanvasError('Could not update the shared canvas. Please try again.');
    } finally { setPending(false); }
  }

  async function leerDatos() { // Define la función para leer datos
    try {
      // Nombre de la tabla que deseas leer
      const tableName = 'Pixel_Art';
      // Realiza la consulta para obtener los datos
      const { data, error } = await supabase
      .from(tableName)
      .select('pixel_colors').eq('id', 1).single();
      if (error) {throw error;}
      //console.log('Datos leídos correctamente:', data[0].pixel_colors);
      if (!Array.isArray(data?.pixel_colors) || data.pixel_colors.length !== 16) throw new Error('Invalid canvas');
      setPixels(data.pixel_colors);
      setReady(true);
      setCanvasError('');
    } catch (error) {
      setReady(false);
      setCanvasError('Could not load the shared canvas.');
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
          table: 'Pixel_Art',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (Array.isArray(payload.new.pixel_colors)) {
            setPixels(payload.new.pixel_colors);
            setReady(true);
          }
        }
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
    leerDatos();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      localStorage.setItem('playerName', playerName);
    }
  };
  return (
    <div className="pixel-art-page">
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
          value={playerName.charAt(0).toUpperCase()+playerName.slice(1)}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e)}
          id="input_name"
        />
        <label htmlFor="input_name" className="user-label">Name - Enter to set</label>
      </div>
      {canvasError && <p role="alert">{canvasError} <button className="button_normal" onClick={leerDatos}>Retry</button></p>}
      <div className="pixel-grid" aria-busy={!ready || pending}>
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
      <div className="color-exac-palette">
        <h3 style={{marginRight: "10px"}}>Select Custom Color</h3>
        <input
        style={{width: "44px", height: "44px"}}
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        >
        </input>
      </div>
      <PixelArtGallery pixels={pixels} ready={ready} pending={pending} />
    </div>
  );
};

export default Pixel_Art;
