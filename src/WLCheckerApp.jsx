import { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import { database } from './firebase';
import { ref, get } from 'firebase/database';

const SOURCE_STYLES = {
  Supporter: { bg: '#e8f5e9', border: '#4caf50', color: '#1b5e20', label: '⭐ Early Supporter' },
  Website:   { bg: '#e3f2fd', border: '#2196f3', color: '#0d47a1', label: '🖥️ Website WL' },
  Collabs:   { bg: '#f3e5f5', border: '#9c27b0', color: '#4a148c', label: '🤝 Collab Winner' },
};

const WLCheckerApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'found' | 'notfound' | 'error'
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const trimmed = wallet.trim().toLowerCase();
    if (!trimmed || trimmed.length < 10) return;

    setStatus('loading');
    setResult(null);

    try {
      const snap = await get(ref(database, `whitelisted/${trimmed}`));
      if (snap.exists()) {
        setResult(snap.val());
        setStatus('found');
      } else {
        setStatus('notfound');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck();
  };

  const sourceStyle = result ? (SOURCE_STYLES[result.source] || SOURCE_STYLES.Supporter) : null;

  return (
    <DraggableWindow
      title="WL CHECKER"
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 280 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 220 : 100 }}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={{ width: '580px' }}
    >
      <div style={{
        backgroundColor: '#fff',
        padding: '32px 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        textAlign: 'center',
        minHeight: '280px',
        justifyContent: 'center',
      }}>

        {/* Title */}
        <p style={{ margin: 0, fontFamily: 'var(--font-pixel)', fontSize: '20px', color: '#000080', letterSpacing: '3px' }}>
          WL CHECKER
        </p>
        <p style={{ margin: '-10px 0 0', fontSize: '14px', color: '#555' }}>
          Enter your wallet address below to check your whitelist status.
        </p>

        {/* Input */}
        <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <input
            type="text"
            value={wallet}
            onChange={e => { setWallet(e.target.value); setStatus(null); setResult(null); }}
            onKeyDown={handleKeyDown}
            placeholder="0x..."
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '14px',
              border: '2px solid #000',
              fontFamily: 'var(--font-terminal)',
              outline: 'none',
              backgroundColor: '#f5f5f5',
            }}
          />
          <button
            className="win95-btn"
            onClick={handleCheck}
            disabled={status === 'loading'}
            style={{ padding: '10px 22px', fontSize: '15px', whiteSpace: 'nowrap' }}
          >
            {status === 'loading' ? '...' : 'CHECK'}
          </button>
        </div>

        {/* Results */}
        {status === 'loading' && (
          <p style={{ fontSize: '16px', color: '#555' }}>🔍 Scanning the canvas...</p>
        )}

        {status === 'found' && sourceStyle && (
          <div style={{
            width: '100%',
            backgroundColor: sourceStyle.bg,
            border: `2px solid ${sourceStyle.border}`,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '28px' }}>✅</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-pixel)', fontSize: '16px', color: sourceStyle.color }}>
              WHITELISTED
            </p>
            <div style={{
              backgroundColor: sourceStyle.border,
              color: '#fff',
              padding: '6px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}>
              {sourceStyle.label}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#333' }}>
              Your spot is secured. All WL is 100% Guaranteed. Enjoy the art 🎨
            </p>
          </div>
        )}

        {status === 'notfound' && (
          <div style={{
            width: '100%',
            backgroundColor: '#fce4ec',
            border: '2px solid #e53935',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '28px' }}>❌</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-pixel)', fontSize: '15px', color: '#b71c1c' }}>
              NOT FOUND
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
              This wallet is not on the list yet. Make sure you entered the correct address, or check back after the next WL round.
            </p>
          </div>
        )}

        {status === 'error' && (
          <p style={{ fontSize: '14px', color: '#e53935' }}>Something went wrong. Please try again.</p>
        )}

        <button
          className="win95-btn"
          onClick={onClose}
          style={{ padding: '7px 36px', fontSize: '15px' }}
        >
          Close
        </button>
      </div>
    </DraggableWindow>
  );
};

export default WLCheckerApp;
