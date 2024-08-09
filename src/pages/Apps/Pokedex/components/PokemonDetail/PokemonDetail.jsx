import React, { useEffect, useState } from 'react';
import './PokemonDetail.css';

const PokemonDetail = ({ pokemon }) => {
  const [details, setDetails] = useState(null);
  const [gender, setGender] = useState({ male: null, female: null });

  useEffect(() => {
    if (pokemon) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then(response => response.json())
        .then(data => {
          setDetails(data);
          return fetch(data.species.url);
        })
        .then(response => response.json())
        .then(speciesData => {
          const maleRate = speciesData.gender_rate;
          if (maleRate === -1) {
            setGender({ male: 0, female: 0 });
          } else {
            const femaleRate = maleRate * 12.5;
            setGender({ male: 100 - femaleRate, female: femaleRate });
          }
        });
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
            {details.sprites?.other?.showdown?.front_default && (
              <img
                className='pokemon-thumbnail'
                style={{ marginRight: '10px' }}
                src={details.sprites.other.showdown.front_default}
                alt={details.name}
              />
            )}
            <h2 className='pokemon-name'>{details.name} #{details.id}</h2>
            {details.sprites?.other?.showdown?.front_default && (
              <img
                className='pokemon-thumbnail pokemon-invert'
                src={details.sprites.other.showdown.front_default}
                alt={details.name}
              />
            )}
          </div>
          <div className='details-container'>
            <img
              className='pokemon-image'
              style={{ borderRadius: '50%' }}
              src={details.sprites.other['official-artwork'].front_default}
              alt={details.name}
            />
            <div className='pokemon-details'>
              <div className='pokemon-characteristics'>
                <div className='characteristic'>
                  <p className='label'>Height</p>
                  <p className='value'>{details.height / 10} m</p>
                </div>
                <div className='characteristic'>
                  <p className='label'>Weight</p>
                  <p className='value'>{details.weight / 10} kg</p>
                </div>
                <div className='characteristic'>
                  <p className='label'>Type</p>
                  <p className='value'>{details.types.map(type => type.type.name).join(', ')}</p>
                </div>
                <div className='characteristic'>
                  <p className='label'>Abilities</p>
                  <p className='value'>{details.abilities.map(ability => ability.ability.name).join(', ')}</p>
                </div>
                <div className='characteristic'>
                  <p className='label'>Gender</p>
                  <p className='value-gender'>
                    {gender.male === 0 && gender.female === 0
                      ? '♀️♂'
                      : (
                        <>
                          {gender.male > 0 && '♀️'}
                          {gender.female > 0 && '♂'}
                        </>
                      )}
                  </p>
                </div>
                <div className='characteristic'>
                  <p className='label'>Sound</p>
                  <div>
                    <span className='play-icon' onClick={() => playSound(details.cries.latest)}>🔊</span>
                    <span className='play-icon' onClick={() => playSound(details.cries.legacy)}>🔊</span>
                  </div>
                </div>
              </div>
              <p>Stats:</p>
              <div className='stats-container'>
                {details.stats.map(stat => (
                  <div key={stat.stat.name} className='stat-bar'>
                    <span className='stat-label'>{stat.stat.name}</span>
                    <div className='stat-bar-inner' style={{ width: `${stat.base_stat/4}%` }}>
                      <span className='stat-value'>{stat.base_stat}</span>
                    </div>
                  </div>
                ))}
                {/* Base Experience Bar */}
                <div className='stat-bar'>
                  <span className='stat-label'>Base Experience</span>
                  <div className='stat-bar-inner' style={{ width: `${details.base_experience / 5}%` }}>
                    <span className='stat-value'>{details.base_experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Search a Pokémon to see the details.</p>
      )}
    </div>
  );
};

export default PokemonDetail;
