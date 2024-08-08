import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import PokemonSearch from './components/PokemonSearch/PokemonSearch';
import PokemonDetail from './components/PokemonDetail/PokemonDetail';
import './Pokedex.css';

const App = () => {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  return (

    <div>
      <Navbar />
      <h1>Pokedex</h1>
      <PokemonSearch 
        onPokemonClick={setSelectedPokemon} 
        selectedPokemon={selectedPokemon}
      />
      <PokemonDetail pokemon={selectedPokemon} />
    </div>
  );
};

export default App;
