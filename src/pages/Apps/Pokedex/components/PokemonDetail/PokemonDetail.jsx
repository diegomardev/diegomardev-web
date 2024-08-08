import React, { useEffect, useState } from 'react';
import './PokemonDetail.css';

const PokemonDetail = ({ pokemon }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (pokemon) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then(response => response.json())
        .then(data => setDetails(data));
    }
  }, [pokemon]);

  return (
    <div>
      {details ? (
        <div>
          <div className='name-container'>
            <img
              className='pokemon-thumbnail'
              src={details.sprites.other.showdown.front_default}
              alt={details.name}
            />
            <h2 className='pokemon-name'> {details.name} #{details.id}</h2>
            <img
              className='pokemon-thumbnail pokemon-invert'
              src={details.sprites.other.showdown.front_default}
              alt={details.name}
            />
          </div>
          <div className='details-container'>
            <img
              className='pokemon-image'
              src={details.sprites.other['official-artwork'].front_default}
              alt={details.name}
            />
            <div className='pokemon-details'>
              <p>Height: {details.height}</p>
              <p>Weight: {details.weight}</p>
              <p>Type: {details.types.map(type => type.type.name).join(', ')}</p>
              <p>Abilities: {details.abilities.map(ability => ability.ability.name).join(', ')}</p>
            </div>
            
          </div>
        </div>
      ) : (
        <p>Select a Pokémon to see the details.</p>
      )}
    </div>
  );
};

export default PokemonDetail;
