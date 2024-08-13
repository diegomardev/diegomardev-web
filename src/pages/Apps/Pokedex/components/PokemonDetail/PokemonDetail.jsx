import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import './PokemonDetail.css';
import arrow_icon from '../../../../../assets/images/pokedex/arrow.svg';
import male_icon from '../../../../../assets/images/pokedex/male-icon.svg';
import female_icon from '../../../../../assets/images/pokedex/female-icon.svg';
import speaker from '../../../../../assets/images/pokedex/speaker.svg';

const PokemonDetail = ({ pokemon, onPokemonClick }) => {
  const [details, setDetails] = useState(null);
  const [gender, setGender] = useState({ male: null, female: null });
  const [evolutionChain, setEvolutionChain] = useState([]);

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
          return fetch(speciesData.evolution_chain.url);
        })
        .then(response => response.json())
        .then(evolutionData => {
          const fetchEvolutionDetails = (url) => {
            return fetch(url)
              .then(response => response.json())
              .then(data => ({
                name: data.name,
                id: data.id,
                types: data.types.map(type => type.type.name),
                sprite: data.sprites.other['official-artwork'].front_default,
              }));
          };

          const chain = [];
          let currentStage = evolutionData.chain;

          const fetchChainDetails = async () => {
            while (currentStage) {
              const evolutionDetails = await fetchEvolutionDetails(
                currentStage.species.url.replace('pokemon-species', 'pokemon')
              );
              chain.push(evolutionDetails);
              currentStage = currentStage.evolves_to[0];
            }
            setEvolutionChain(chain);
          };

          fetchChainDetails();
        });
    }
  }, [pokemon]);

  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  // Diseño para PC ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const renderDesktopLayout = () => (
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
                  ? 'Unknown'
                  : (
                    <>
                      {gender.male > 0 && <img src={male_icon} alt="Male Gender" />}
                      {gender.female > 0 && <img src={female_icon} alt="Female Gender" />}
                    </>
                  )}
              </p>
            </div>
            <div className='characteristic'>
              <p className='label'>Sound</p>
              <div>
                <img src={speaker} className='play-icon' onClick={() => playSound(details.cries.latest)}/>
                <img src={speaker} className='play-icon' onClick={() => playSound(details.cries.legacy)}/>
              </div>
            </div>
          </div>
          <p className='stat-title'>Stats</p>
          <div className='stats-container'>
            
            {details.stats.map(stat => (
              <div key={stat.stat.name} className='stat-bar'>
                <span className='stat-label'>{stat.stat.name}</span>
                <div className='stat-bar-inner' style={{ width: `${stat.base_stat/4}%` }}>
                  <span className='stat-value'>{stat.base_stat}</span>
                </div>
              </div>
            ))}
            <div className='stat-bar'>
              <span className='stat-label'>Base Experience</span>
              <div className='stat-bar-inner' style={{ width: `${details.base_experience / 6}%` }}>
                <span className='stat-value'>{details.base_experience}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='evolution-container'>
        <p className='evolution-title'>Evolutions</p>
        <div className='evolution-list'>
          {evolutionChain.map((evo, index) => (
            <div key={index} className='evolution-item' onClick={() => onPokemonClick(evo.name)}>
              <img src={evo.sprite} alt={evo.name} className='evolution-image' style={{ borderRadius: '50%' }} />
              <div className='evolution-info'>
                <p className='evolution-name'>{evo.name} #{evo.id}</p>
                <div className='evolution-types'>
                  {evo.types.map((type, index) => (
                    <span key={index} className={`type-label ${type}`}>{type}</span>
                  ))}
                </div>
              </div>
              {index < evolutionChain.length - 1 && (
                <img src={arrow_icon} alt="Arrow icon" className="evolution-arrow-icon" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Diseño para móvil //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const renderMobileLayout = () => (
    <div>
      <div className='name-container'>
      {details.sprites?.other?.showdown?.front_default && (
          <img
            className='pokemon-thumbnail pokemon-invert'
            style={{ marginRight: '10px' }}
            src={details.sprites.other.showdown.front_default}
            alt={details.name}
          />
        )}
        <h2 className='pokemon-name-mobile'>{details.name} #{details.id}</h2>
        {details.sprites?.other?.showdown?.front_default && (
          <img
            className='pokemon-thumbnail'
            style={{ marginRight: '10px' }}
            src={details.sprites.other.showdown.front_default}
            alt={details.name}
          />
        )}
      </div>
      <div className='details-container-mobile'>
        <img
          className='pokemon-image-mobile'
          style={{ borderRadius: '50%', width: '300px', height: '300px' }} // Imágenes más pequeñas para móviles
          src={details.sprites.other['official-artwork'].front_default}
          alt={details.name}
        />
        <div className='pokemon-details-mobile'>
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
                  ? 'Unknown'
                  : (
                    <>
                      {gender.male > 0 && <img src={male_icon} alt="Male Gender" />}
                      {gender.female > 0 && <img src={female_icon} alt="Female Gender" />}
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
          <p className='stat-title'>Stats</p>
          <div className='stats-container'>
            
            {details.stats.map(stat => (
              <div key={stat.stat.name} className='stat-bar'>
                <span className='stat-label'>{stat.stat.name}</span>
                <div className='stat-bar-inner' style={{ width: `${stat.base_stat/4}%` }}>
                  <span className='stat-value'>{stat.base_stat}</span>
                </div>
              </div>
            ))}
            <div className='stat-bar'>
              <span className='stat-label'>Base Experience</span>
              <div className='stat-bar-inner' style={{ width: `${details.base_experience / 6}%` }}>
                <span className='stat-value'>{details.base_experience}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='evolution-container'>
        <p className='evolution-title'>Evolutions</p>
        <div className='evolution-list-mobile'>
          {evolutionChain.map((evo, index) => (
            <div key={index} className='evolution-item' onClick={() => onPokemonClick(evo.name)}>
              <img src={evo.sprite} alt={evo.name} className='evolution-image' style={{ borderRadius: '50%' }} />
              <div className='evolution-info-mobile'>
                <p className='evolution-name'>{evo.name} #{evo.id}</p>
                <div className='evolution-types'>
                  {evo.types.map((type, index) => (
                    <span key={index} className={`type-label ${type}`}>{type}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {details ? (
        isMobile ? renderMobileLayout() : renderDesktopLayout()
      ) : (
        <p>Search a Pokémon to see the details.</p>
      )}
    </div>
  );
};

export default PokemonDetail;