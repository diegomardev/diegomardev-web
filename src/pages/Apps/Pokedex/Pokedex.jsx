import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import PokemonSearch from './components/PokemonSearch/PokemonSearch';
import PokemonDetail from './components/PokemonDetail/PokemonDetail';
import './Pokedex.css';

const App = () => {
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Leer el parámetro 'pokemon' de la URL al cargar el componente
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialPokemon = query.get('pokemon');
    if (initialPokemon) {
      setSelectedPokemon(initialPokemon);
    }
  }, []);

  // Actualizar la URL cuando se selecciona un Pokémon
  useEffect(() => {
    if (selectedPokemon) {
      window.history.pushState(null, '', `?pokemon=${selectedPokemon}`);
    }
  }, [selectedPokemon]);

  return (
    <div>
      <Navbar />
      <h1>Pokedex</h1>
      <PokemonSearch 
        onPokemonClick={setSelectedPokemon} 
        selectedPokemon={selectedPokemon}
      />
      <PokemonDetail 
        pokemon={selectedPokemon} 
        onPokemonClick={setSelectedPokemon}
      />
    </div>
  );
};

export default App;
