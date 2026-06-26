import { useState, useEffect, Fragment } from 'react';
import DraggableWindow from './DraggableWindow';
import { database } from './firebase';
import { ref, get, push, serverTimestamp } from 'firebase/database';

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Tasks' },
  { id: 3, label: 'Wallet' },
  { id: 4, label: 'Submit' },
];

const MAX_SPOTS = 200;

const WLWizard = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState({ follow: false, like_rt: false });
  const [xUsername, setXUsername] = useState('');
  const [commentLink, setCommentLink] = useState('');
  const [wallet, setWallet] = useState('');
  const [walletError, setWalletError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Round state — loaded from Firebase wl_config
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(null);
  const [roundLabel, setRoundLabel] = useState('');
  const [tweetLink, setTweetLink] = useState('https://x.com/MStick_NFT');
  const [spotsUsed, setSpotsUsed] = useState(0);
  const [roundFull, setRoundFull] = useState(false);
  const [alreadySubmittedLocal, setAlreadySubmittedLocal] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch the current round config from Firebase or use default
        const configSnap = await get(ref(database, 'wl_config'));
        const config = configSnap.exists() ? configSnap.val() : {
          current_round: 'round_1',
          round_label: 'Round 1',
          tweet_link: 'https://x.com/MStick_NFT'
        };

        const round = config.current_round;
        const label = config.round_label || round;
        const tweet = config.tweet_link || 'https://x.com/MStick_NFT';

        setCurrentRound(round);
        setRoundLabel(label);
        setTweetLink(tweet);

        // 2. Check localStorage for this specific round (per-round lock)
        if (localStorage.getItem(`mstick_submitted_${round}`) === 'true') {
          setAlreadySubmittedLocal(true);
          setLoading(false);
          return;
        }

        // 3. Count current round's applications
        const appsSnap = await get(ref(database, `applications/${round}`));
        const count = appsSnap.exists() ? Object.keys(appsSnap.val()).length : 0;
        setSpotsUsed(count);
        if (count >= MAX_SPOTS) setRoundFull(true);

      } catch (e) {
        console.error('WLWizard init error:', e);
        setRoundFull(true);
        setRoundLabel('Error loading round: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const completeTask = (key) => setTasks((t) => ({ ...t, [key]: true }));

  const isValidCommentLink = (link) =>
    /^https?:\/\/(x\.com|twitter\.com)\/.+/i.test(link.trim());

  const allTasksDone =
    tasks.follow &&
    tasks.like_rt &&
    isValidCommentLink(commentLink) &&
    xUsername.trim() !== '';

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

  const validateWallet = () => {
    if (!isValidAddress(wallet)) {
      setWalletError('Please enter a valid EVM wallet address (0x...)');
      return false;
    }
    setWalletError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateWallet()) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const appsRef = ref(database, `applications/${currentRound}`);
      const snapshot = await get(appsRef);

      // Race condition protection — recheck spot count
      const currentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      if (currentCount >= MAX_SPOTS) {
        setRoundFull(true);
        setSpotsUsed(currentCount);
        setSubmitting(false);
        return;
      }

      // Check duplicates within this round
      if (snapshot.exists()) {
        const apps = Object.values(snapshot.val());
        const walletLower = wallet.trim().toLowerCase();
        const xUserLower = xUsername.trim().toLowerCase();
        const cleanXUser = xUserLower.startsWith('@') ? xUserLower.substring(1) : xUserLower;

        for (const app of apps) {
          const dbWallet = app.wallet ? app.wallet.toLowerCase() : '';
          const dbXRaw = app.xUsername ? app.xUsername.toLowerCase() : '';
          const dbX = dbXRaw.startsWith('@') ? dbXRaw.substring(1) : dbXRaw;

          if (dbWallet === walletLower) {
            setSubmitError('Error: This wallet address has already been submitted this round.');
            setSubmitting(false);
            return;
          }
          if (dbX === cleanXUser) {
            setSubmitError('Error: This X username has already been submitted this round.');
            setSubmitting(false);
            return;
          }
        }
      }

      // Submit to Firebase
      await push(appsRef, {
        wallet: wallet.trim(),
        xUsername: xUsername.trim(),
        commentLink: commentLink.trim(),
        round: currentRound,
        timestamp: serverTimestamp(),
      });

      // Lock this round for this browser
      localStorage.setItem(`mstick_submitted_${currentRound}`, 'true');
      setSpotsUsed(currentCount + 1);
      setSubmitting(false);
      setSubmitted(true);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Error: ' + (error.message || 'Failed to connect. Check console for details.'));
      setSubmitting(false);
    }
  };

  const openLink = (url) => window.open(url, '_blank');
  const spotsRemaining = Math.max(0, MAX_SPOTS - spotsUsed);

  return (
    <DraggableWindow
      title="WL Wizard"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      initialPosition={{
        x: typeof window !== 'undefined' ? window.innerWidth / 2 - 360 : 100,
        y: typeof window !== 'undefined' ? window.innerHeight / 2 - 250 : 100,
      }}
      style={{ width: '580px' }}
    >
      <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>🔒</div>
        <p style={{ fontWeight: 'bold', fontSize: '24px', color: 'var(--win95-blue)', marginBottom: '16px', letterSpacing: '1px' }}>
          WL WIZARD IS CLOSED
        </p>
        <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '20px', fontSize: '16px', maxWidth: '450px', margin: '0 auto 24px', textAlign: 'center', lineHeight: '1.6' }}>
          <strong>Thank you for always supporting!</strong><br/><br/>
          The WL Wizard is officially closed now.<br/>See you guys on Mint Day. Let's enjoy the art! 🎨
        </div>
        <button className="win95-btn" style={{ padding: '8px 40px', fontSize: '16px', fontWeight: 'bold' }} onClick={onClose}>
          Close
        </button>
      </div>
    </DraggableWindow>
  );
};

export default WLWizard;
