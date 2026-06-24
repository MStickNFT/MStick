import { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import { database } from './firebase';
import { ref, push, get } from 'firebase/database';
import trash1 from './assets/TRASH 1.png';
import trash2 from './assets/TRASH 2.png';
import trash3 from './assets/TRASH 3.png';
import trash4 from './assets/TRASH 4.png';
import trash5 from './assets/TRASH 5.png';
import errorSound from './assets/Error.mp3';


const RecycleBinApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [openTxt, setOpenTxt] = useState(false);
  const [openBmp, setOpenBmp] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [selectedTrash, setSelectedTrash] = useState(null);

  // Secret WL form states
  const [xUsername, setXUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | submitting | success | full | codeFull | codeInvalid | error
  const [spotCount, setSpotCount] = useState(null);
  const [openHint, setOpenHint] = useState(false);

  const MAX_SPOTS = 100;
  const CODE_LIMIT = 30;

  const handleOpenTxt = () => {
    setOpenTxt(true);
    if (localStorage.getItem('mstick_secret_submitted') === 'true') {
      setSubmitStatus('alreadySubmitted');
      return;
    }
    setSubmitStatus('idle');
    setXUsername('');
    setWalletAddress('');
    setAccessCode('');
    // Read current spot count from Firebase
    const wlRef = ref(database, 'secret_wl');
    get(wlRef).then((snapshot) => {
      const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setSpotCount(count);
    }).catch(() => setSpotCount(0));
  };

  const [openFunny, setOpenFunny] = useState(false);
  const [openMeme, setOpenMeme] = useState(false);
  const [openLore256, setOpenLore256] = useState(false);

  const binItems = [
    { id: 9, name: 'DO_NOT_OPEN.TXT', type: 'funny' },
    { id: 10, name: 'DRAFTV2_FINAL.TXT', type: 'meme' },
    { id: 11, name: 'DELETED_LORE.TXT', type: 'lore256' },
    { id: 12, name: 'FRAGMENT_001.TXT', type: 'hint' },
    { id: 2, name: 'REJECTED.BMP', type: 'bmp' },
    { id: 3, name: 'WAGMI.EXE', type: 'exe' },
    { id: 4, name: 'TRASH 1.png', type: 'trash', src: trash1 },
    { id: 5, name: 'TRASH 2.png', type: 'trash', src: trash2 },
    { id: 1, name: 'TEMP_OLD.TXT', type: 'secret' },
    { id: 6, name: 'TRASH 3.png', type: 'trash', src: trash3 },
    { id: 7, name: 'TRASH 4.png', type: 'trash', src: trash4 },
    { id: 8, name: 'TRASH 5.png', type: 'trash', src: trash5 },
  ];

  const handleDoubleClick = (item) => {
    if (item.type === 'secret') handleOpenTxt();
    if (item.type === 'hint') setOpenHint(true);
    if (item.type === 'funny') setOpenFunny(true);
    if (item.type === 'meme') setOpenMeme(true);
    if (item.type === 'lore256') setOpenLore256(true);
    if (item.type === 'bmp') setOpenBmp(true);
    if (item.type === 'exe') {
      const audio = new Audio(errorSound);
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio error:', e));
      setOpenError(true);
    }
    if (item.type === 'trash') setSelectedTrash(item);
  };

  const handleWLSubmit = async () => {
    if (!xUsername.trim() || !walletAddress.trim() || !accessCode.trim()) return;
    setSubmitStatus('submitting');
    try {
      // 1. Check overall cap
      const wlRef = ref(database, 'secret_wl');
      const wlSnap = await get(wlRef);
      const allEntries = wlSnap.exists() ? Object.values(wlSnap.val()) : [];
      const currentCount = allEntries.length;
      if (currentCount >= MAX_SPOTS) {
        setSpotCount(currentCount);
        setSubmitStatus('full');
        return;
      }

      // 1.5 Check for duplicate wallet or username
      const walletLower = walletAddress.trim().toLowerCase();
      const xUserLower = xUsername.trim().toLowerCase();
      const cleanXUser = xUserLower.startsWith('@') ? xUserLower.substring(1) : xUserLower;

      let isDuplicate = false;
      for (let i = 0; i < allEntries.length; i++) {
        const dbWallet = allEntries[i].walletAddress ? allEntries[i].walletAddress.toLowerCase() : '';
        const dbXUserRaw = allEntries[i].xUsername ? allEntries[i].xUsername.toLowerCase() : '';
        const dbXUser = dbXUserRaw.startsWith('@') ? dbXUserRaw.substring(1) : dbXUserRaw;

        if (dbWallet === walletLower || dbXUser === cleanXUser) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        setSubmitStatus('duplicate');
        return;
      }

      // 2. Validate active code from Firebase
      const codeRef = ref(database, 'active_code');
      const codeSnap = await get(codeRef);
      if (!codeSnap.exists()) {
        setSubmitStatus('codeInvalid');
        return;
      }
      const activeCode = codeSnap.val();
      const normalizedInput = accessCode.trim().replace('#', '').toUpperCase();
      const normalizedActive = activeCode.code.replace('#', '').toUpperCase();
      if (normalizedInput !== normalizedActive) {
        setSubmitStatus('codeInvalid');
        return;
      }

      // 3. Check per-code limit (30 per tweet)
      const codeUsageCount = allEntries.filter(e => 
        e.code && e.code.replace('#','').toUpperCase() === normalizedActive
      ).length;
      if (codeUsageCount >= CODE_LIMIT) {
        setSubmitStatus('codeFull');
        return;
      }

      // 4. Submit
      await push(wlRef, {
        xUsername: xUsername.trim(),
        walletAddress: walletAddress.trim(),
        code: normalizedActive,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('mstick_secret_submitted', 'true');
      setSpotCount(codeUsageCount + 1);
      setSubmitStatus('success');
    } catch (_err) {
      setSubmitStatus('error');
    }
  };

  const FileSVG = (item) => {
    if (item.type === 'trash') {
      return (
        <svg width="60" height="60" viewBox="0 0 40 40">
          <rect x="8" y="8" width="24" height="24" fill="#00FFFF" stroke="#000" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="#fff" />
          <path d="M 8 32 L 16 20 L 22 26 L 28 16 L 32 20 L 32 32 Z" fill="#000" opacity="0.3" />
        </svg>
      );
    }
    if (['txt', 'secret', 'funny', 'meme', 'lore256', 'hint'].includes(item.type)) {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M 8 2 L 24 2 L 32 10 L 32 38 L 8 38 Z" fill="#fff" stroke="#000" strokeWidth="2" />
          <path d="M 24 2 L 24 10 L 32 10" fill="none" stroke="#000" strokeWidth="2" />
          <line x1="12" y1="16" x2="28" y2="16" stroke="#000" strokeWidth="2" />
          <line x1="12" y1="22" x2="28" y2="22" stroke="#000" strokeWidth="2" />
          <line x1="12" y1="28" x2="20" y2="28" stroke="#000" strokeWidth="2" />
        </svg>
      );
    }
    if (item.type === 'bmp') {
      return (
        <svg width="60" height="60" viewBox="0 0 40 40">
          <rect x="8" y="8" width="24" height="24" fill="#00FFFF" stroke="#000" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="#fff" />
          <path d="M 8 32 L 16 20 L 22 26 L 28 16 L 32 20 L 32 32 Z" fill="#000" opacity="0.3" />
        </svg>
      );
    }
    return (
      <svg width="60" height="60" viewBox="0 0 40 40">
        <rect x="8" y="8" width="24" height="24" fill="#ccc" stroke="#000" strokeWidth="2" />
        <rect x="12" y="12" width="16" height="12" fill="#fff" stroke="#000" strokeWidth="2" />
        <line x1="8" y1="8" x2="16" y2="16" stroke="#000" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <>
      <DraggableWindow 
        title="Recycle Bin" 
        initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 360 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 225 : 100 }}
        onClose={onClose} 
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        isMaximized={isMaximized}
        style={{ width: '720px', height: '470px' }}
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
            Recycle Bin
          </div>
        </div>

        {/* File Grid */}
        <div style={{ flexGrow: 1, backgroundColor: '#fff', padding: '15px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'min-content', gap: '20px' }}>
          {binItems.map((item) => (
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
              <div style={{ width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {FileSVG(item)}
              </div>
              <div style={{ 
                fontSize: '13px', 
                textAlign: 'center', 
                fontFamily: 'var(--font-terminal)',
                wordBreak: 'break-all',
                color: '#000',
                padding: '2px 4px'
              }}>
                {item.name}
              </div>
            </div>
          ))}
        </div>
        
        {/* Status Bar */}
        <div style={{ padding: '2px 8px', fontSize: '11px', borderTop: 'var(--border-inset)', backgroundColor: 'var(--win95-gray)', display: 'flex', justifyContent: 'space-between' }}>
          <span>8 object(s)</span>
          <span>14 KB</span>
        </div>
      </DraggableWindow>

      {/* TXT Modal — Feature Removed Notice */}
      {openTxt && (
        <DraggableWindow
          title="Notepad - SECRETS.TXT"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 240 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setOpenTxt(false)}
          style={{ width: '480px', zIndex: 1002 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: '#fff', padding: '20px', fontFamily: 'var(--font-terminal)', fontSize: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#808080" />
              <line x1="10" y1="10" x2="22" y2="22" stroke="#fff" strokeWidth="4" />
              <line x1="22" y1="10" x2="10" y2="22" stroke="#fff" strokeWidth="4" />
            </svg>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '17px', letterSpacing: '2px' }}>FEATURE REMOVED</p>
            <p style={{ margin: 0, color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
              This feature has been disabled due to botting activity.
            </p>
            <p style={{ margin: 0, color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
              We removed it to protect real community members. Every guaranteed spot goes to a real person, not a script.
            </p>
            <p style={{ margin: 0, color: '#333', fontSize: '13px', fontStyle: 'italic' }}>
              Stay active. Real supporters get rewarded.
            </p>
            <button className="win95-btn" style={{ padding: '6px 28px', fontSize: '14px', marginTop: '5px' }} onClick={() => setOpenTxt(false)}>Close</button>
          </div>
        </DraggableWindow>
      )}

      {/* Hint TXT Modal - FRAGMENT_001.TXT */}
      {openHint && (
        <DraggableWindow
          title="Notepad - FRAGMENT_001.TXT"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 300 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setOpenHint(false)}
          style={{ width: '550px', zIndex: 1002 }}
        >
          <textarea
            readOnly
            style={{ flexGrow: 1, width: '100%', minHeight: '380px', border: 'none', resize: 'none', padding: '15px', fontFamily: 'var(--font-terminal)', fontSize: '20px', boxSizing: 'border-box' }}
            defaultValue={`If you are reading this, you are early.\n\nBut being early isn't enough.\nYou need the key.\n\nWatch the 1/1s closely.\nEvery piece we drop holds a color.\nThe exact hex code of that color is your ACCESS CODE.\n\nBut be fast. Each color only opens the door 30 times.\nOnce 30 people enter it, the door locks.\n\nFind the color. Enter the code. Secure your spot.\nWe are watching.`}
          />
        </DraggableWindow>
      )}

      {/* Funny TXT Modal - DO_NOT_OPEN.TXT */}
      {openFunny && (
        <DraggableWindow
          title="Notepad - DO_NOT_OPEN.TXT"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 300 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setOpenFunny(false)}
          style={{ width: '450px', zIndex: 1002 }}
        >
          <textarea
            readOnly
            style={{ flexGrow: 1, width: '100%', minHeight: '380px', border: 'none', resize: 'none', padding: '15px', fontFamily: 'var(--font-terminal)', fontSize: '20px', boxSizing: 'border-box' }}
            defaultValue={`I told you not to open this.\n\nSeriously.\n\nOkay fine. Since you're here:\n\n- The mint is going to be crazy\n- You should probably follow us\n- This file has 0 useful information\n- But you opened it anyway\n\nYou passed the vibe check.\nClose this and go draw something.`}
          />
        </DraggableWindow>
      )}

      {/* Meme TXT Modal - DRAFTV2_FINAL.TXT */}
      {openMeme && (
        <DraggableWindow
          title="Notepad - DRAFTV2_FINAL.TXT"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 300 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setOpenMeme(false)}
          style={{ width: '540px', zIndex: 1002 }}
        >
          <textarea
            readOnly
            style={{ flexGrow: 1, width: '100%', minHeight: '380px', border: 'none', resize: 'none', padding: '15px', fontFamily: 'var(--font-terminal)', fontSize: '20px', boxSizing: 'border-box' }}
            defaultValue={`NFT MARKETING DRAFT v2 FINAL FINAL (USE THIS ONE)\n\n> "gm"\n> "gm"\n> "gm"\n> "gm"\n> "gm"\n> [post stickman jpeg]\n> "gm"\n\nStrategy: Post stickman.\nBackup strategy: Post stickman again.\nContingency: Post stickman but sideways.\n\nTODO: Figure out what utility means\nTODO: Stop saying "gm"\nTODO: (we will not stop saying gm)\n\n[END OF DOCUMENT]`}
          />
        </DraggableWindow>
      )}

      {/* Lore 256 TXT Modal - DELETED_LORE.TXT */}
      {openLore256 && (
        <DraggableWindow
          title="Notepad - DELETED_LORE.TXT"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 300 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setOpenLore256(false)}
          style={{ width: '525px', zIndex: 1002 }}
        >
          <textarea
            readOnly
            style={{ flexGrow: 1, width: '100%', minHeight: '380px', border: 'none', resize: 'none', padding: '15px', fontFamily: 'var(--font-terminal)', fontSize: '20px', boxSizing: 'border-box' }}
            defaultValue={`[DELETED LORE - v0.1 DRAFT]\n\nTHE 256 ERA\n-----------\nIn 1987, MS Paint upgraded to 256 colors.\nThe world changed. The canvas expanded.\nFor the first time, stickmen had a palette.\n\nIn tribute to that era, the original\nmint price was set at $2.56.\n\nNot chosen. Inherited from the machine.\n\n[NOTE: This lore was scrapped.]\n[We went back further. To 1985.]\n[The year it all actually started.]\n[See MStick.TXT for the real story.]`}
          />
        </DraggableWindow>
      )}

      {/* BMP Modal */}
      {openBmp && (
        <DraggableWindow
          title="MS Photo Editor - REJECTED.BMP"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 150 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 150 : 150 }}
          onClose={() => setOpenBmp(false)}
          style={{ width: '300px', height: '300px', zIndex: 1002 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', border: 'var(--border-inset)', margin: '5px' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--border-inset)' }}>
              <img src={stickImg} alt="Rejected Stickman" style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'pixelated', filter: 'invert(1) blur(1px)' }} />
            </div>
          </div>
        </DraggableWindow>
      )}

      {/* Trash Image Modal */}
      {selectedTrash && (
        <DraggableWindow
          title={`MS Photo Editor - ${selectedTrash.name}`}
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 200 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 150 }}
          onClose={() => setSelectedTrash(null)}
          style={{ width: '400px', height: '400px', zIndex: 1002 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', border: 'var(--border-inset)', margin: '5px' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--border-inset)' }}>
              <img src={selectedTrash.src} alt={selectedTrash.name} style={{ width: '90%', height: '90%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
          </div>
        </DraggableWindow>
      )}

      {/* EXE Error Modal */}
      {openError && (
        <DraggableWindow
          title="Error"
          initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 150 : 150, y: typeof window !== 'undefined' ? window.innerHeight/2 - 75 : 150 }}
          onClose={() => setOpenError(false)}
          style={{ width: '300px', height: '180px', zIndex: 1003 }}
        >
          <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', flexDirection: 'column', padding: '15px', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="red" />
                <line x1="10" y1="10" x2="22" y2="22" stroke="#fff" strokeWidth="4" />
                <line x1="22" y1="10" x2="10" y2="22" stroke="#fff" strokeWidth="4" />
              </svg>
              <div style={{ fontSize: '12px' }}>
                <p style={{ margin: '0 0 5px 0' }}>Fatal Error: WAGMI.EXE</p>
                <p style={{ margin: 0 }}>This file is unstable. Try harder next time.</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
              <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setOpenError(false)}>OK</button>
            </div>
          </div>
        </DraggableWindow>
      )}
    </>
  );
};

export default RecycleBinApp;
