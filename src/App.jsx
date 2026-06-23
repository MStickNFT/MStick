import { useState, useEffect } from 'react';
import './index.css';
import BootScreen from './BootScreen';
import PaintApp from './PaintApp';
import DraggableWindow from './DraggableWindow';
import WLWizard from './WLWizard';
import NotepadApp from './NotepadApp';
import GalleryApp from './GalleryApp';
import StickChatApp from './StickChatApp';
import RecycleBinApp from './RecycleBinApp';
import clickSoundFile from './assets/Click.mp3';
import stickImg from './assets/stick.png';
import recycleBinImg from './assets/recyclebin.png';
import welcomeImg from './assets/welcome.png';
import WLCheckerApp from './WLCheckerApp';
import CollabsApp from './CollabsApp';

const DesktopIcon = ({ svgIcon, label, onClick, style }) => (
  <div className="desktop-icon" tabIndex="0" onDoubleClick={onClick} onClick={onClick} style={style}>
    <div className="desktop-icon-img">{svgIcon}</div>
    <div className="desktop-icon-label">{label}</div>
  </div>
);

function App() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  
  const [welcomeWin, setWelcomeWin] = useState({ open: true, minimized: false, maximized: false });
  const [paintWin, setPaintWin] = useState({ open: false, minimized: false, maximized: false });
  const [wlWin, setWlWin] = useState({ open: false, minimized: false, maximized: false });
  const [loreWin, setLoreWin] = useState({ open: false, minimized: false, maximized: false });
  const [galleryWin, setGalleryWin] = useState({ open: false, minimized: false, maximized: false });
  const [chatWin, setChatWin] = useState({ open: false, minimized: false, maximized: false });
  const [recycleWin, setRecycleWin] = useState({ open: false, minimized: false, maximized: false });
  const [wlCheckerWin, setWlCheckerWin] = useState({ open: false, minimized: false, maximized: false });
  const [collabsWin, setCollabsWin] = useState({ open: false, minimized: false, maximized: false });
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Global click sound on every button
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.closest('button')) {
        const audio = new Audio(clickSoundFile);
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const handlePowerOn = () => {
    setIsPoweredOn(true);
  };

  if (!isPoweredOn) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--win95-white)', margin: 0, fontSize: '4rem' }}>MStick OS</h1>
        <button 
          className="win95-btn" 
          onClick={handlePowerOn}
          style={{ padding: '12px 28px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}
        >
          <span style={{ fontSize: '22px', color: 'red' }}>⏻</span> Power On
        </button>
      </div>
    );
  }

  if (!isBooted) {
    return <BootScreen onBootComplete={() => setIsBooted(true)} />;
  }

  const PaintSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <rect x="4" y="8" width="24" height="18" fill="#e0e0e0" stroke="#000" strokeWidth="2" rx="4" />
      <circle cx="10" cy="14" r="3" fill="#ff0000" />
      <circle cx="16" cy="14" r="3" fill="#00ff00" />
      <circle cx="22" cy="14" r="3" fill="#0000ff" />
      <circle cx="10" cy="20" r="3" fill="#ffff00" />
      <circle cx="16" cy="20" r="3" fill="#ff00ff" />
      <path d="M 22 22 L 28 16 L 30 18 L 24 24 Z" fill="#8b4513" stroke="#000" strokeWidth="1" />
      <path d="M 28 16 L 32 12 L 30 10 L 26 14 Z" fill="#c0c0c0" stroke="#000" strokeWidth="1" />
    </svg>
  );

  const ReadmeSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <path d="M 6 2 L 20 2 L 26 8 L 26 30 L 6 30 Z" fill="#fff" stroke="#000" strokeWidth="2" />
      <path d="M 20 2 L 20 8 L 26 8" fill="none" stroke="#000" strokeWidth="2" />
      <line x1="10" y1="14" x2="22" y2="14" stroke="#000" strokeWidth="2" />
      <line x1="10" y1="18" x2="22" y2="18" stroke="#000" strokeWidth="2" />
      <line x1="10" y1="22" x2="18" y2="22" stroke="#000" strokeWidth="2" />
    </svg>
  );

  const ChatSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <rect x="4" y="6" width="24" height="16" fill="#fff" stroke="#000" strokeWidth="2" />
      <path d="M 8 22 L 8 28 L 14 22 Z" fill="#fff" stroke="#000" strokeWidth="2" />
      <line x1="8" y1="10" x2="24" y2="10" stroke="#000" strokeWidth="2" />
      <line x1="8" y1="14" x2="20" y2="14" stroke="#000" strokeWidth="2" />
    </svg>
  );

  const WizardSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <polygon points="16,4 6,24 26,24" fill="#4b0082" stroke="#000" strokeWidth="2" />
      <polygon points="4,24 28,24 28,28 4,28" fill="#4b0082" stroke="#000" strokeWidth="2" />
      <polygon points="16,8 14,14 18,14" fill="#ffff00" />
      <polygon points="12,16 10,20 14,20" fill="#ffff00" />
      <polygon points="20,18 18,22 22,22" fill="#ffff00" />
    </svg>
  );

  const FolderSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <path d="M 2 10 L 2 28 L 30 28 L 30 10 Z" fill="#f5c518" stroke="#000" strokeWidth="2" />
      <path d="M 2 10 L 12 10 L 14 6 L 2 6 Z" fill="#f5c518" stroke="#000" strokeWidth="2" />
      <path d="M 2 10 L 30 10 L 30 28 L 2 28 Z" fill="#ffe066" stroke="#000" strokeWidth="1.5" />
      <path d="M 4 12 L 28 12" stroke="#f5c518" strokeWidth="1" />
    </svg>
  );

  const RecycleSVG = (
    <img src={recycleBinImg} alt="Recycle Bin" style={{ width: '100%', height: '100%', imageRendering: 'pixelated', transform: 'scale(1.35)' }} />
  );

  const WLCheckSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#fff" stroke="#000" strokeWidth="2" />
      <circle cx="14" cy="14" r="6" fill="none" stroke="#000080" strokeWidth="2.5" />
      <line x1="19" y1="19" x2="27" y2="27" stroke="#000080" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11" y1="14" x2="17" y2="14" stroke="#00aa00" strokeWidth="2" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="#00aa00" strokeWidth="2" />
    </svg>
  );

  const CollabsSVG = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ filter: 'drop-shadow(1px 1px 0 #000)' }}>
      <rect x="2" y="6" width="28" height="22" rx="2" fill="#fff" stroke="#000" strokeWidth="2" />
      <rect x="2" y="6" width="28" height="6" fill="#000080" rx="2" />
      <line x1="7" y1="17" x2="25" y2="17" stroke="#c0c0c0" strokeWidth="1" />
      <line x1="7" y1="21" x2="25" y2="21" stroke="#c0c0c0" strokeWidth="1" />
      <line x1="7" y1="25" x2="20" y2="25" stroke="#c0c0c0" strokeWidth="1" />
      <line x1="14" y1="6" x2="14" y2="28" stroke="#c0c0c0" strokeWidth="1" />
    </svg>
  );

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons-container">
        <DesktopIcon svgIcon={PaintSVG} label="MStick Paint" onClick={() => setPaintWin({...paintWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={ReadmeSVG} label="MStick.TXT" onClick={() => setLoreWin({...loreWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={FolderSVG} label="1 OF 1s (A:)" onClick={() => setGalleryWin({...galleryWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={WizardSVG} label="WL Wizard" onClick={() => setWlWin({...wlWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={ChatSVG} label="StickChat" onClick={() => setChatWin({...chatWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={WLCheckSVG} label="WL Checker" onClick={() => setWlCheckerWin({...wlCheckerWin, open: true, minimized: false})} />
        <DesktopIcon svgIcon={CollabsSVG} label="Collabs" onClick={() => setCollabsWin({...collabsWin, open: true, minimized: false})} />
        
        {/* Recycle bin explicitly positioned to top right and scaled up */}
        <DesktopIcon 
          svgIcon={RecycleSVG} 
          label="Recycle Bin" 
          onClick={() => setRecycleWin({...recycleWin, open: true, minimized: false})} 
          style={{ position: 'absolute', top: '25px', right: '25px' }}
        />
      </div>

      {paintWin.open && !paintWin.minimized && (
        <PaintApp 
          onClose={() => setPaintWin({...paintWin, open: false})} 
          onMinimize={() => setPaintWin({...paintWin, minimized: true})}
          onMaximize={() => setPaintWin({...paintWin, maximized: !paintWin.maximized})}
          isMaximized={paintWin.maximized}
        />
      )}

      {wlWin.open && !wlWin.minimized && (
        <WLWizard
          onClose={() => setWlWin({...wlWin, open: false})}
          onMinimize={() => setWlWin({...wlWin, minimized: true})}
          onMaximize={() => setWlWin({...wlWin, maximized: !wlWin.maximized})}
          isMaximized={wlWin.maximized}
        />
      )}

      {loreWin.open && !loreWin.minimized && (
        <NotepadApp 
          onClose={() => setLoreWin({...loreWin, open: false})}
          onMinimize={() => setLoreWin({...loreWin, minimized: true})}
          onMaximize={() => setLoreWin({...loreWin, maximized: !loreWin.maximized})}
          isMaximized={loreWin.maximized}
        />
      )}

      {galleryWin.open && !galleryWin.minimized && (
        <GalleryApp 
          onClose={() => setGalleryWin({...galleryWin, open: false})}
          onMinimize={() => setGalleryWin({...galleryWin, minimized: true})}
          onMaximize={() => setGalleryWin({...galleryWin, maximized: !galleryWin.maximized})}
          isMaximized={galleryWin.maximized}
        />
      )}

      {chatWin.open && !chatWin.minimized && (
        <StickChatApp 
          onClose={() => setChatWin({...chatWin, open: false})}
          onMinimize={() => setChatWin({...chatWin, minimized: true})}
          onMaximize={() => setChatWin({...chatWin, maximized: !chatWin.maximized})}
          isMaximized={chatWin.maximized}
        />
      )}

      {recycleWin.open && !recycleWin.minimized && (
        <RecycleBinApp 
          onClose={() => setRecycleWin({...recycleWin, open: false})}
          onMinimize={() => setRecycleWin({...recycleWin, minimized: true})}
          onMaximize={() => setRecycleWin({...recycleWin, maximized: !recycleWin.maximized})}
          isMaximized={recycleWin.maximized}
        />
      )}

      {wlCheckerWin.open && !wlCheckerWin.minimized && (
        <WLCheckerApp
          onClose={() => setWlCheckerWin({...wlCheckerWin, open: false})}
          onMinimize={() => setWlCheckerWin({...wlCheckerWin, minimized: true})}
          onMaximize={() => setWlCheckerWin({...wlCheckerWin, maximized: !wlCheckerWin.maximized})}
          isMaximized={wlCheckerWin.maximized}
        />
      )}

      {collabsWin.open && !collabsWin.minimized && (
        <CollabsApp
          onClose={() => setCollabsWin({...collabsWin, open: false})}
          onMinimize={() => setCollabsWin({...collabsWin, minimized: true})}
          onMaximize={() => setCollabsWin({...collabsWin, maximized: !collabsWin.maximized})}
          isMaximized={collabsWin.maximized}
        />
      )}

      {welcomeWin.open && !welcomeWin.minimized && (
        <DraggableWindow 
          title="Welcome to MStick.exe" 
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 275 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 100 }}
          onClose={() => setWelcomeWin({...welcomeWin, open: false})}
          onMinimize={() => setWelcomeWin({...welcomeWin, minimized: true})}
          onMaximize={() => setWelcomeWin({...welcomeWin, maximized: !welcomeWin.maximized})}
          isMaximized={welcomeWin.maximized}
          style={{ width: '550px' }}
        >
          <div style={{ padding: '20px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <img src={welcomeImg} alt="Welcome to MStick" style={{ width: '50%', height: 'auto', imageRendering: 'pixelated', marginBottom: '10px' }} />
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ margin: '0 auto 10px', fontSize: '24px', textAlign: 'center' }}>Welcome to MStick OS</h2>
              <p style={{ margin: '0 0 8px', fontSize: '18px', textAlign: 'center' }}>1,985 stickmen. Born in MS Paint.</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#555', textAlign: 'center' }}>The OG Canvas. The OG Culture.</p>
            </div>
            <button 
              className="win95-btn" 
              onClick={() => setWelcomeWin({...welcomeWin, open: false})} 
              style={{ padding: '8px 45px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}
            >
              OK
            </button>
          </div>
        </DraggableWindow>
      )}
      
      {/* Start Menu */}
      {startMenuOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1001 }}
            onClick={() => setStartMenuOpen(false)}
          />
          <div style={{
            position: 'absolute',
            bottom: '35px',
            left: '2px',
            width: '200px',
            backgroundColor: 'var(--win95-gray)',
            boxShadow: 'var(--border-outset)',
            zIndex: 1002,
            display: 'flex',
          }}>
            <div style={{ width: '30px', backgroundColor: '#000080' }}>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2px', backgroundColor: 'var(--win95-gray)' }}>
              <button className="start-menu-item" onClick={() => { setPaintWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">🖌️</span> Programs ▸ Paint
              </button>
              <button className="start-menu-item" onClick={() => { setLoreWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">📄</span> Documents ▸ MStick.TXT
              </button>
              <button className="start-menu-item" onClick={() => { setGalleryWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">🖼️</span> Gallery ▸ 1 OF 1
              </button>
              <button className="start-menu-item" onClick={() => { setWlWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">🔑</span> Submit Application
              </button>
              <button className="start-menu-item" onClick={() => { setWlCheckerWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">🔍</span> WL Checker
              </button>
              <button className="start-menu-item" onClick={() => { setCollabsWin({ open: true, minimized: false, maximized: false }); setStartMenuOpen(false); }}>
                <span className="start-menu-item-icon">📋</span> Collabs Ledger
              </button>
              <div style={{ height: '2px', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 2px' }} />
              <button className="start-menu-item" onClick={() => { setStartMenuOpen(false); setIsPoweredOn(false); setIsBooted(false); }}>
                <span className="start-menu-item-icon">⏻</span> Shut Down...
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Taskbar Fixed at Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '35px',
        backgroundColor: 'var(--win95-gray)',
        boxShadow: 'var(--border-outset)',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 5px',
        zIndex: 1000
      }}>
        <button 
          className="win95-btn" 
          style={{ fontWeight: 'bold', padding: '4px 8px', fontSize: '15px', boxShadow: startMenuOpen ? 'var(--border-inset)' : 'var(--border-outset)' }}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span style={{ marginRight: '6px', fontSize: '16px' }}>❖</span> Start
        </button>
        
        <div style={{ display: 'flex', gap: '5px', marginLeft: '10px', height: '100%' }}>
          {welcomeWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: welcomeWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setWelcomeWin({...welcomeWin, minimized: !welcomeWin.minimized})}
            >
              Welcome to MSti...
            </button>
          )}
          {paintWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: paintWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setPaintWin({...paintWin, minimized: !paintWin.minimized})}
            >
              MStick Paint
            </button>
          )}
          {wlWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: wlWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setWlWin({...wlWin, minimized: !wlWin.minimized})}
            >
              WL Wizard
            </button>
          )}
          {loreWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: loreWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setLoreWin({...loreWin, minimized: !loreWin.minimized})}
            >
              MStick.TXT
            </button>
          )}
          {galleryWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: galleryWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setGalleryWin({...galleryWin, minimized: !galleryWin.minimized})}
            >
              1 OF 1
            </button>
          )}
          {chatWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: chatWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setChatWin({...chatWin, minimized: !chatWin.minimized})}
            >
              StickChat
            </button>
          )}
          {recycleWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: recycleWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setRecycleWin({...recycleWin, minimized: !recycleWin.minimized})}
            >
              Recycle Bin
            </button>
          )}
          {wlCheckerWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: wlCheckerWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setWlCheckerWin({...wlCheckerWin, minimized: !wlCheckerWin.minimized})}
            >
              WL Checker
            </button>
          )}
          {collabsWin.open && (
            <button 
              className="win95-btn" 
              style={{ width: '150px', justifyContent: 'flex-start', padding: '2px 5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: collabsWin.minimized ? 'var(--border-outset)' : 'var(--border-inset)' }}
              onClick={() => setCollabsWin({...collabsWin, minimized: !collabsWin.minimized})}
            >
              Collabs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
