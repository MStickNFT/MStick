import DraggableWindow from './DraggableWindow';

const NotepadApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  return (
    <DraggableWindow 
      title="MStick.TXT - Notepad" 
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 300 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 325 : 100 }}
      onClose={onClose} 
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={{ width: '600px', height: '650px' }}
    >
      <div className="win95-menu-bar" style={{ display: 'flex', gap: '15px', padding: '2px 5px', borderBottom: '1px solid #dfdfdf', backgroundColor: 'var(--win95-gray)' }}>
        <span style={{ cursor: 'pointer' }}>File</span>
        <span style={{ cursor: 'pointer' }}>Edit</span>
        <span style={{ cursor: 'pointer' }}>Search</span>
        <span style={{ cursor: 'pointer' }}>Help</span>
      </div>
      
      {/* Text Area */}
      <div style={{ flexGrow: 1, padding: '2px', display: 'flex', backgroundColor: 'var(--win95-gray)' }}>
        <textarea 
          className="win95-input"
          readOnly
          style={{ 
            flexGrow: 1, 
            resize: 'none', 
            fontFamily: "'Courier New', Courier, monospace", // Classic fixed-width notepad font
            fontSize: '14px',
            padding: '5px',
            backgroundColor: '#ffffff',
            border: '2px inset #dfdfdf',
            outline: 'none',
            lineHeight: '1.5'
          }}
          defaultValue={`MStick — README.TXT
======================

THE ORIGINS: 1985
-----------------
The year is 1985. The very first strokes of digital
art were ever made. Before layers, before undo history,
before generative AI... there was only the canvas
and the mouse.

MStick is a tribute to that era. 1,985 stickmen
born from the only tool that ever mattered — MS Paint.


THE 16 ONE-OF-ONES
-------------------
In classic MS Paint, the default color palette had
exactly 16 colors. No more. No less.

To honor this, MStick contains exactly 16 hand-drawn,
completely unique 1/1s — one for each color in the
original palette. These are the rarest stickmen
in existence.


MINT PRICE
----------
To honor the true origins of the software, the mint
price was decided by history. Not chosen — inherited.
$1.985. A price point born from the year it all began.


SUPPLY
------
Total Supply: 1,985 NFTs
1/1s: 16 (The 16-color palette tribute)


The OG Canvas. The OG Culture.
Coming to Ethereum. | @MStick_NFT
`}
        />
      </div>
    </DraggableWindow>
  );
};

export default NotepadApp;
