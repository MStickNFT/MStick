import DraggableWindow from './DraggableWindow';

const WLCheckerApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  return (
    <DraggableWindow
      title="WL CHECKER"
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 280 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 200 : 100 }}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={{ width: '560px' }}
    >
      <div style={{
        backgroundColor: '#fff',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
        minHeight: '250px',
        justifyContent: 'center',
      }}>
        {/* Blinking radar / scanner icon */}
        <div style={{ fontSize: '64px', lineHeight: 1 }}>🔍</div>

        <div>
          <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-pixel)', fontSize: '22px', color: '#000080', letterSpacing: '4px' }}>
            WL CHECKER
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 'bold' }}>
            Coming Soon
          </p>
          <p style={{ margin: 0, fontSize: '16px', color: '#555' }}>
            You'll soon be able to check if your wallet<br />
            is on the MStick whitelist.
          </p>
        </div>

        <div style={{
          backgroundColor: '#fffbe6',
          border: '1px solid #000',
          padding: '12px 20px',
          fontSize: '15px',
          maxWidth: '420px',
        }}>
          <strong>Stay tuned.</strong> This feature is currently under construction.
          Follow <strong>@MStick_NFT</strong> for updates.
        </div>

        <button
          className="win95-btn"
          onClick={onClose}
          style={{ padding: '8px 40px', marginTop: '8px', fontSize: '16px' }}
        >
          OK
        </button>
      </div>
    </DraggableWindow>
  );
};

export default WLCheckerApp;
