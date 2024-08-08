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

  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };
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
            <h2 className='pokemon-name'>{details.name} #{details.id}</h2>
            <img
              className='pokemon-thumbnail pokemon-invert'
              src={details.sprites.other.showdown.front_default}
              alt={details.name}
            />
          </div>
          <div className='details-container'>
            <img
              className='pokemon-image'
              style={{ borderRadius: '50%' }}
              src={details.sprites.other['official-artwork'].front_default}
              alt={details.name}
            />
            <div className='pokemon-details'>
              <p>Height: {details.height}</p>
              <p>Weight: {details.weight}</p>
              <p>Type: {details.types.map(type => type.type.name).join(', ')}</p>
              <p>Abilities: {details.abilities.map(ability => ability.ability.name).join(', ')}</p>
              <p>Stats:</p>
              <ul>
                {details.stats.map(stat => (
                  <li key={stat.stat.name}>{stat.stat.name}: {stat.base_stat}</li>
                ))}
              </ul>
              <p>Base Experience: {details.base_experience}</p>
              <audio id="pokemon-cry" src={details.cries.latest} />
              <div className='audio-container'>
                <span className='play-icon' onClick={() => playSound(details.cries.latest)}>🔊</span>
                <span className='play-icon' onClick={() => playSound(details.cries.legacy)}>🔊</span>
            </div>
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
