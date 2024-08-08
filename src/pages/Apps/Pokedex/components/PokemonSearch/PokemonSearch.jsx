import React, { useEffect, useState } from 'react';
import './PokemonSearch.css';

const PokemonSearch = ({ onPokemonClick }) => {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [isListVisible, setIsListVisible] = useState(false);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
      .then(response => response.json())
      .then(data => setPokemon(data.results));
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      setFilteredPokemon(
        pokemon.filter(poke => 
          poke.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredPokemon([]);
    }
  }, [searchTerm, pokemon]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInputClick = () => {
    setIsListVisible(true);
  };

  const handleCloseList = () => {
    setIsListVisible(false);
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search Pokémon" 
        value={searchTerm}
        onChange={handleChange} 
        onClick={handleInputClick}
      />
      {isListVisible && searchTerm.length >= 3 && (
        <ul>
          <li 
            onClick={handleCloseList}
            className="close-list"
          >
            Close List  ❌
          </li>
          {filteredPokemon.map(poke => (
            <li 
              key={poke.name} 
              onClick={() => onPokemonClick(poke.name)}
              className={poke.name === searchTerm ? 'selected' : ''}
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
