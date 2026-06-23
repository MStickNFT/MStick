import { useEffect, useState } from 'react';
import './BootScreen.css';
import startupSoundFile from './assets/MS 9 Sound.mp3';

const BootScreen = ({ onBootComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play the startup sound
    const bootSound = new Audio(startupSoundFile);
    bootSound.volume = 0.5; // Set volume to 50%
    bootSound.play().catch(e => {
      console.log('Audio play blocked or failed:', e);
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onBootComplete(), 600);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [onBootComplete]);

  const blocks = Math.floor(Math.min(progress, 100) / 5);

  return (
    <div className="boot-screen">
      {/* Logo */}
      <div className="boot-logo" style={{ marginBottom: '100px' }}>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '3rem', color: 'var(--win95-white)', margin: 0, textShadow: '2px 2px #000' }}>
          MStick OS
        </h1>
        <p style={{ fontFamily: 'var(--font-pixel)', color: 'var(--win95-gray)', marginTop: '10px' }}>
          Version 1985
        </p>
      </div>

      {/* Loading Group */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        
        {/* Loading Bar Area */}
        <div style={{ position: 'relative', width: '300px' }}>
          {/* Stickman Track to clip him when he runs off the edge */}
          <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', height: '70px', overflow: 'hidden', marginBottom: '-5px' }}>
            <div className="stickman-runner">
              <svg width="48" height="64" viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                {/* Head */}
                <circle cx="24" cy="10" r="8" fill="none" stroke="white" strokeWidth="2.5" />

                {/* Body */}
                <g className="stickman-body">
                  {/* Torso */}
                  <line x1="24" y1="18" x2="24" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Left Arm */}
                  <line
                    className="arm-left"
                    x1="24" y1="22" x2="10" y2="32"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  />

                  {/* Right Arm */}
                  <line
                    className="arm-right"
                    x1="24" y1="22" x2="38" y2="32"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  />

                  {/* Left Leg */}
                  <line
                    className="leg-left"
                    x1="24" y1="38" x2="12" y2="54"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  />

                  {/* Right Leg */}
                  <line
                    className="leg-right"
                    x1="24" y1="38" x2="36" y2="54"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
          </div>

          {/* Loading Bar */}
          <div className="boot-loading-container" style={{ position: 'relative' }}>
            <div className="boot-loading-bar">
              {Array.from({ length: blocks }).map((_, i) => (
                <div key={i} className="boot-loading-block" />
              ))}
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <p style={{
          fontFamily: 'var(--font-pixel)', fontSize: '12px',
          color: 'var(--win95-gray)', letterSpacing: '1px', margin: 0
        }}>
          Loading MStick OS... {Math.min(progress, 100)}%
        </p>
      </div>
    </div>
  );
};

export default BootScreen;
