import { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import yellowImg from './assets/Yellow.png';
import cyanImg from './assets/Cyan.jpg';
import blueImg from './assets/Blue.jpg';
import redImg from './assets/Red.jpg';
import purpleImg from './assets/Purple.jpg';
import darkGreenImg from './assets/Dark Green.png';
import fuchsiaImg from './assets/Fuchsia.jpg';
import navyBlueImg from './assets/Navy Blue.png';
import errorSound from './assets/Error.mp3';

const GalleryApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorFile, setErrorFile] = useState(null);

  // Generate 16 items.
  const galleryItems = [
    { id: 1, type: 'unlocked', name: 'YELLOW_FFFF00.BMP', color: '#FFFF00', src: yellowImg },
    { id: 2, type: 'unlocked', name: 'CYAN_00FFFF.BMP', color: '#00FFFF', src: cyanImg },
    { id: 3, type: 'unlocked', name: 'RED_FF0000.BMP', color: '#FF0000', src: redImg },
    { id: 4, type: 'unlocked', name: 'PURPLE_800080.BMP', color: '#800080', src: purpleImg },
    { id: 5, type: 'unlocked', name: 'BLUE_0000FF.BMP', color: '#0000FF', src: blueImg },
    { id: 6, type: 'unlocked', name: 'DARK_GREEN_008000.BMP', color: '#008000', src: darkGreenImg },
    { id: 7, type: 'unlocked', name: 'FUCHSIA_FF00FF.BMP', color: '#FF00FF', src: fuchsiaImg },
    { id: 8, type: 'unlocked', name: 'NAVY_BLUE_000080.BMP', color: '#000080', src: navyBlueImg },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 9,
      type: 'locked',
      name: `CORRUPTED_${String(i + 1).padStart(2, '0')}.DAT`,
    }))
  ];

  const handleDoubleClick = (item) => {
    if (item.type === 'unlocked') {
      setSelectedImage(item);
    } else {
      const audio = new Audio(errorSound);
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio error:', e));
      setErrorFile(item);
    }
  };

  const BrokenFileSVG = (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(1px 1px 0 #fff)' }}>
      <rect x="8" y="4" width="24" height="32" fill="#fff" stroke="#000" strokeWidth="2" />
      <path d="M 24 4 L 32 12 L 24 12 Z" fill="#000" />
      <line x1="12" y1="16" x2="28" y2="16" stroke="#ccc" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="12" y1="20" x2="28" y2="20" stroke="#ccc" strokeWidth="2" strokeDasharray="2 4" />
      <line x1="12" y1="24" x2="24" y2="24" stroke="#ccc" strokeWidth="2" strokeDasharray="4 4" />
      <text x="20" y="22" fontFamily="var(--font-pixel)" fontSize="20" fill="red" textAnchor="middle" fontWeight="bold">?</text>
    </svg>
  );

  const ImageFileSVG = (color) => (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(1px 1px 0 #fff)' }}>
      <rect x="8" y="8" width="24" height="24" fill={color} stroke="#000" strokeWidth="2" />
      <circle cx="16" cy="16" r="3" fill="#fff" />
      <path d="M 8 32 L 16 20 L 22 26 L 28 16 L 32 20 L 32 32 Z" fill="#000" opacity="0.3" />
    </svg>
  );

  return (
    <>
      <DraggableWindow 
        title="A:\\1 OF 1" 
        initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 360 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 275 : 100 }}
        onClose={onClose} 
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        isMaximized={isMaximized}
        style={{ width: '720px', height: '550px' }}
      >
        <div className="win95-menu-bar" style={{ display: 'flex', gap: '15px', padding: '2px 5px', borderBottom: '1px solid #dfdfdf', backgroundColor: 'var(--win95-gray)' }}>
          <span style={{ cursor: 'pointer' }}>File</span>
          <span style={{ cursor: 'pointer' }}>Edit</span>
          <span style={{ cursor: 'pointer' }}>View</span>
          <span style={{ cursor: 'pointer' }}>Help</span>
        </div>
        
        {/* Address Bar */}
        <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--win95-gray)', borderBottom: '1px solid #888' }}>
          <span style={{ fontSize: '13px' }}>Address</span>
          <div style={{ flexGrow: 1, backgroundColor: '#fff', border: 'var(--border-inset)', padding: '2px 5px', fontFamily: 'var(--font-terminal)', fontSize: '12px' }}>
            A:\1 OF 1
          </div>
        </div>

        {/* File Grid */}
        <div style={{ flexGrow: 1, backgroundColor: '#fff', padding: '15px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'min-content', gap: '20px' }}>
          {galleryItems.map((item) => (
            <div 
              key={item.id}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '5px',
                cursor: 'pointer',
                padding: '5px',
              }}
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                opacity: item.type === 'locked' ? 0.6 : 1
              }}>
                {item.type === 'unlocked' ? ImageFileSVG(item.color) : BrokenFileSVG}
              </div>
              <div style={{ 
                fontSize: '13px', 
                textAlign: 'center', 
                fontFamily: 'var(--font-terminal)',
                wordBreak: 'break-all',
                backgroundColor: item.type === 'unlocked' ? '#000080' : 'transparent',
                color: item.type === 'unlocked' ? '#fff' : '#000',
                padding: '2px 4px'
              }}>
                {item.name}
              </div>
            </div>
          ))}
        </div>
        
        {/* Status Bar */}
        <div style={{ padding: '2px 8px', fontSize: '11px', borderTop: 'var(--border-inset)', backgroundColor: 'var(--win95-gray)', display: 'flex', justifyContent: 'space-between' }}>
          <span>16 object(s)</span>
          <span>1.44MB Total Space</span>
        </div>
      </DraggableWindow>

      {/* Image Preview Modal */}
      {selectedImage && (
        <DraggableWindow
          title={`MS Photo Editor - ${selectedImage.name}`}
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 250 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 260 : 150 }}
          onClose={() => setSelectedImage(null)}
          style={{ width: '500px', height: '520px', zIndex: 1001 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', padding: '20px', border: 'var(--border-inset)', margin: '5px', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ 
              flex: 1, 
              backgroundColor: '#fff', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              boxShadow: 'var(--border-inset)',
              padding: '10px',
              minHeight: 0,
              minWidth: 0
            }}>
              <img src={selectedImage.src} alt="Stickman" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </DraggableWindow>
      )}


      {/* Custom Error Dialog */}
      {errorFile && (
        <DraggableWindow
          title="Error"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 150 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 90 : 150 }}
          onClose={() => setErrorFile(null)}
          style={{ width: '300px', height: '180px', zIndex: 1002 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', flexDirection: 'column', padding: '15px', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="red" />
                <line x1="10" y1="10" x2="22" y2="22" stroke="#fff" strokeWidth="4" />
                <line x1="22" y1="10" x2="10" y2="22" stroke="#fff" strokeWidth="4" />
              </svg>
              <div style={{ fontSize: '12px' }}>
                <p style={{ margin: '0 0 5px 0' }}>Error reading A:\{errorFile.name}</p>
                <p style={{ margin: 0 }}>File may be corrupted or unauthorized.</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
              <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setErrorFile(null)}>OK</button>
            </div>
          </div>
        </DraggableWindow>
      )}
    </>
  );
};

export default GalleryApp;
