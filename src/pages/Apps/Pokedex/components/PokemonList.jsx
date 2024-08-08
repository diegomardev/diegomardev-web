import React, { useEffect, useState } from 'react';

const PokemonList = ({ onPokemonClick }) => {
  const [pokemon, setPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(response => response.json())
      .then(data => setPokemon(data.results));
  }, []);

  return (
    <div>
      <h2>Pokémon List</h2>
      <ul>
        {pokemon.map(poke => (
          <li 
            key={poke.name} 
            onClick={() => onPokemonClick(poke.name)}
            className={poke.name === selectedPokemon ? 'selected' : ''}
          >
            {poke.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonList;