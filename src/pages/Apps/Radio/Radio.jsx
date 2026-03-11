import React, { useRef, useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import './Radio.css';

function Radio() {

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const streamUrl =
    "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CLASSIC_SC";

  const handlePlay = async () => {
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error reproduciendo", err);
    }
  };

  const handlePause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <>
      <Navbar />

      <h1 className="read-the-docs">LOS40 Classic</h1>

      <div className="radio-player">

        <audio
          ref={audioRef}
          controls
          preload="none"
          className="radio-player__audio"
        >
          <source
            src={streamUrl}
            type="audio/mpeg"
          />
        </audio>

        <div className="radio-player__buttons">

          <button className="button_normal" onClick={handlePlay}>
            Play
          </button>

          <button className="button_normal" onClick={handlePause}>
            Pause
          </button>

        </div>

        <p className="radio-status">
          {isPlaying ? "🔴 Reproduciendo" : "⏸️ Pausado"}
        </p>

      </div>
    </>
  );
}

export default Radio;