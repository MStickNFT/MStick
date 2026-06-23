import { useState, useRef, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';
import { database } from './firebase';
import { ref, onValue, push, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';

// A list of random retro/stickman names
const randomNames = [
  'BucketFill_99', 'PixelPusher', 'StickFanatic', 'Ctrl_Z_Master', 
  'HexCode_FF0000', 'PencilTool', 'Eraser_Boy', 'MsPaintPro', 
  'LineDrawer', 'Corrupted_Dat', 'CryptoStick', 'CanvasKing',
  'Anon_1985', 'Save_As_BMP', 'LFG_Stick', 'Yellow_1of1'
];

// Generate a consistent vivid color from a username string
const getUserColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 80%, 35%)`;
};

const StickChatApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState(() => randomNames[Math.floor(Math.random() * randomNames.length)] + '_' + Math.floor(Math.random() * 999));
  const chatEndRef = useRef(null);

  const generateRandomName = () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + '_' + Math.floor(Math.random() * 999);
    setUsername(randomName);
  };

  // Connect to Firebase and listen to messages
  useEffect(() => {
    // Only get the last 50 messages so it doesn't crash the browser
    const messagesRef = query(ref(database, 'messages'), orderByChild('timestamp'), limitToLast(50));
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object into an array and sort by timestamp
        const loadedMessages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const [lastSent, setLastSent] = useState(0);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    if (userText.length > 200) {
      alert("Message is too long (max 200 characters).");
      return;
    }

    const now = Date.now();
    if (now - lastSent < 2000) {
      alert("Please wait 2 seconds between messages.");
      return;
    }
    setLastSent(now);

    setInputValue('');

    // Push new message to Firebase
    push(ref(database, 'messages'), {
      sender: username,
      text: userText,
      timestamp: serverTimestamp()
    }).catch(error => {
      console.error("Firebase write error:", error);
      alert("Failed to send message. Check your connection.");
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <DraggableWindow 
      title="StickChat" 
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 275 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 300 : 100 }}
      onClose={onClose} 
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={{ width: '550px', height: '600px' }}
    >
      <div style={{ flexGrow: 1, backgroundColor: 'var(--win95-gray)', display: 'flex', flexDirection: 'column', padding: '5px' }}>
        
        {/* Chat History */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: '#fff', 
          border: 'var(--border-inset)', 
          overflowY: 'auto', 
          padding: '10px',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ flexShrink: 1 }}>
                <span style={{ color: msg.sender === 'System' ? '#888' : msg.sender === username ? '#0000AA' : getUserColor(msg.sender), fontWeight: 'bold' }}>
                  {msg.sender}:
                </span>{' '}
                {msg.text}
              </span>
              <span style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{username}</span>
          <button 
            className="win95-btn" 
            onClick={generateRandomName}
            style={{ padding: '0 8px', fontSize: '13px', height: '28px' }}
            title="Get a new random name"
          >
            ↺
          </button>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              flexGrow: 1, 
              border: 'var(--border-inset)', 
              padding: '6px 10px',
              fontSize: '14px'
            }}
          />
          <button 
            className="win95-btn" 
            onClick={handleSend}
            style={{ padding: '0 20px', fontWeight: 'bold', fontSize: '14px', height: '28px' }}
          >
            Send
          </button>
        </div>

      </div>
    </DraggableWindow>
  );
};

export default StickChatApp;
