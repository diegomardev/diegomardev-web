import React, { useEffect, useState } from 'react';
import './PokemonSearch.css';

const PokemonSearch = ({ onPokemonClick }) => {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Índice para resaltar el elemento actual

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
      .then(response => response.json())
      .then(data => setPokemon(data.results));
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setFilteredPokemon(
        pokemon.filter(poke => 
          poke.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setIsListVisible(true);
    } else {
      setFilteredPokemon([]);
      setIsListVisible(false);  // Oculta la lista si no hay suficientes caracteres
    }
    setHighlightedIndex(-1); // Resetea el índice resaltado cuando cambia el término de búsqueda
  }, [searchTerm, pokemon]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInputClick = () => {
    setIsListVisible(true);
  };

  const handleKeyDown = (event) => {
    if (isListVisible && filteredPokemon.length > 0) {
      if (event.key === 'ArrowDown') {
        // Mover hacia abajo en la lista
        setHighlightedIndex((prevIndex) =>
          prevIndex < filteredPokemon.length - 1 ? prevIndex + 1 : 0
        );
      } else if (event.key === 'ArrowUp') {
        // Mover hacia arriba en la lista
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredPokemon.length - 1
        );
      } else if (event.key === 'Enter' && highlightedIndex >= 0) {
        // Seleccionar el elemento resaltado
        onPokemonClick(filteredPokemon[highlightedIndex].name);
        setIsListVisible(false);
      } else if (event.key === 'Escape') {
        // Cerrar la lista si se presiona Esc
        setIsListVisible(false);
      }
    }
  };

  return (
    <div>
      <div className="input-group">
        <input
          id='login_1'
          required
          type="text"
          name="text"
          autoComplete="off"
          className="input input-pokedex"
          value={searchTerm}
          onChange={handleChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown} // Manejar eventos de teclado
        />
        <label htmlFor="login_1" className="user-label">Search Pokémon</label>
      </div>
      {isListVisible && searchTerm.length >= 2 && (
        <ul className='ul-pokedex'>
          <li 
            onClick={() => setIsListVisible(false)}
            className="close-list li-pokedex"
          >
            Close List  ❌
          </li>
          {filteredPokemon.map((poke, index) => (
            <li 
              key={poke.name} 
              onClick={() => {onPokemonClick(poke.name); setIsListVisible(false);}}
              className={`li-pokedex ${index === highlightedIndex ? 'highlighted' : ''}`} // Añadir clase 'highlighted'
            >
              {poke.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PokemonSearch;
