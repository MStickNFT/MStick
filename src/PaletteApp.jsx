import { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import yellowImg from './assets/Yellow.png';

const PaletteApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorFile, setErrorFile] = useState(null);

  // Historically Accurate 16-Color EGA/Windows Palette Order
  // Top Row: Dark Colors + Dark Grey
  // Bottom Row: Light Grey + Bright Colors
  const colors = [
    // Top Row
    { id: 1, type: 'locked', hex: '#000000', name: 'BLACK_000000' },
    { id: 2, type: 'locked', hex: '#800000', name: 'MAROON_800000' },
    { id: 3, type: 'locked', hex: '#008000', name: 'DKGREEN_008000' },
    { id: 4, type: 'locked', hex: '#808000', name: 'OLIVE_808000' },
    { id: 5, type: 'locked', hex: '#000080', name: 'NAVY_000080' },
    { id: 6, type: 'locked', hex: '#800080', name: 'PURPLE_800080' },
    { id: 7, type: 'locked', hex: '#008080', name: 'TEAL_008080' },
    { id: 8, type: 'locked', hex: '#808080', name: 'DKGREY_808080' },
    
    // Bottom Row
    { id: 9, type: 'locked', hex: '#C0C0C0', name: 'LTGREY_C0C0C0' },
    { id: 10, type: 'locked', hex: '#FF0000', name: 'RED_FF0000' },
    { id: 11, type: 'locked', hex: '#00FF00', name: 'GREEN_00FF00' },
    { id: 12, type: 'unlocked', hex: '#FFFF00', name: 'YELLOW_FFFF00', src: yellowImg },
    { id: 13, type: 'locked', hex: '#0000FF', name: 'BLUE_0000FF' },
    { id: 14, type: 'locked', hex: '#FF00FF', name: 'MAGENTA_FF00FF' },
    { id: 15, type: 'locked', hex: '#00FFFF', name: 'CYAN_00FFFF' },
    { id: 16, type: 'locked', hex: '#FFFFFF', name: 'WHITE_FFFFFF' }
  ];

  const handleDoubleClick = (item) => {
    if (item.type === 'unlocked') {
      setSelectedImage(item);
    } else {
      setErrorFile(item);
    }
  };

  return (
    <>
      <DraggableWindow 
        title="Palette" 
        initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 200 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 100 : 100 }}
        onClose={onClose} 
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        isMaximized={isMaximized}
        style={{ width: '400px', height: '220px' }}
      >
        <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', flexDirection: 'column', padding: '15px', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: '2px', 
            padding: '4px',
            backgroundColor: '#000', // To create grid borders
            border: 'var(--border-inset)'
          }}>
            {colors.map((item) => (
              <div 
                key={item.id}
                onDoubleClick={() => handleDoubleClick(item)}
                style={{
                  width: '35px',
                  height: '35px',
                  backgroundColor: item.type === 'unlocked' ? item.hex : 'var(--win95-gray)',
                  border: item.type === 'unlocked' ? 'var(--border-outset)' : 'var(--border-inset)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
                title={item.name}
              >
                {/* Empty block, color fills it if unlocked */}
                {item.type === 'locked' && (
                  <div style={{ width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', backgroundPosition: '0 0, 2px 2px', backgroundSize: '4px 4px' }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px', fontFamily: 'var(--font-pixel)', fontSize: '10px', textAlign: 'center' }}>
            DOUBLE-CLICK COLOR TO REVEAL
          </div>
        </div>
      </DraggableWindow>

      {/* Image Preview Modal */}
      {selectedImage && (
        <DraggableWindow
          title={`MS Photo Editor - ${selectedImage.name}.BMP`}
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 200 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setSelectedImage(null)}
          style={{ width: '400px', height: '400px', zIndex: 1001 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', border: 'var(--border-inset)', margin: '5px' }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#fff', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              boxShadow: 'var(--border-inset)'
            }}>
              <img src={selectedImage.src} alt="Stickman" style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'pixelated' }} />
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
                <p style={{ margin: '0 0 5px 0' }}>Error accessing color data</p>
                <p style={{ margin: 0 }}>Color profile "{errorFile.name}" is locked or unauthorized.</p>
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

export default PaletteApp;
