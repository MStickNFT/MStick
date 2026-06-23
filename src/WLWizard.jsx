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
        // On error, fallback to closed state
        setRoundFull(true);
        setRoundLabel('Error loading round');
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
      setSubmitError('Failed to connect to server. Please try again later.');
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
      style={{ width: '720px' }}
    >
      {/* ── LOADING ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 10px', color: '#555' }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>⌛</div>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px' }}>
            Loading round data...
          </p>
        </div>
      )}

      {/* ── ROUND FULL ── */}
      {!loading && roundFull && !alreadySubmittedLocal && (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🔒</div>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
            {roundLabel}
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '24px', color: 'var(--win95-blue)', marginBottom: '8px' }}>
            This Round Is Closed
          </p>
          <p style={{ fontSize: '15px', marginBottom: '6px' }}>
            All <strong>{MAX_SPOTS} application slots</strong> for this round have been filled.
          </p>
          <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '12px 16px', fontSize: '14px', maxWidth: '550px', margin: '0 auto 20px', textAlign: 'left' }}>
            <strong>Stay tuned.</strong> Winners from this round will be
            announced on <strong>@MStick_NFT</strong>. A new round opens with
            every new tweet — follow us so you don't miss it.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="win95-btn" style={{ padding: '6px 40px', fontSize: '16px' }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── ALREADY SUBMITTED THIS ROUND ── */}
      {!loading && alreadySubmittedLocal && (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
            {roundLabel}
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--win95-blue)', marginBottom: '10px' }}>
            Already Submitted
          </p>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            You have already submitted an application for this round.
          </p>
          <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '10px 14px', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px', textAlign: 'left' }}>
            🔔 A new application window opens with each new tweet from{' '}
            <strong>@MStick_NFT</strong>. Follow us to get in early next time!
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="win95-btn"
              style={{ padding: '6px 40px', fontSize: '16px', fontWeight: 'bold' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN FORM ── */}
      {!loading && !roundFull && !alreadySubmittedLocal && (
        <>
          {/* Round Info Banner */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: '#000080', color: '#fff',
            padding: '6px 12px', marginBottom: '12px', fontSize: '13px',
          }}>
            <span>🎯 <strong>{roundLabel}</strong> — Winners hand-picked from this round's submissions</span>
            <span style={{ fontWeight: 'bold', color: spotsRemaining <= 20 ? '#FFD700' : '#90EE90', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              {spotsRemaining} / {MAX_SPOTS} spots left
            </span>
          </div>

          {/* Progress Steps */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            {STEPS.map((s, i) => (
              <Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: step >= s.id ? 'var(--win95-blue)' : 'var(--win95-gray)',
                    color: step >= s.id ? '#fff' : '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '12px', boxShadow: 'var(--border-outset)',
                  }}>{s.id}</div>
                  <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: '4px',
                    backgroundColor: step > s.id ? 'var(--win95-blue)' : 'var(--win95-dark-gray)',
                    marginBottom: '18px',
                  }} />
                )}
              </Fragment>
            ))}
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <div className="win95-panel" style={{ marginBottom: '15px', padding: '15px' }}>
                <p style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '20px' }}>
                  🖌️ Welcome to the MStick WL Wizard
                </p>
                <p style={{ margin: '0 0 8px', fontSize: '15px' }}>
                  You are applying for a chance to be whitelisted for{' '}
                  <strong>MStick</strong> — 1,985 of the most OG stick figures
                  ever drawn on the blockchain.
                </p>
                <div style={{ backgroundColor: '#e8f4fd', border: '1px solid #000080', padding: '10px', fontSize: '14px', marginBottom: '10px' }}>
                  📋 <strong>How selection works:</strong> We open a fresh 200-spot
                  application window with every new tweet. Winners are{' '}
                  <strong>hand-picked from each round's pool</strong> — not just
                  first come, first served. Follow{' '}
                  <strong>@MStick_NFT</strong> to catch every round.
                </div>
                <ul style={{ margin: '0 0 10px', paddingLeft: '20px', fontSize: '15px' }}>
                  <li>Complete 3 quick engagement tasks on X</li>
                  <li>Submit your EVM wallet address</li>
                  <li>Wallets are scanned to verify authenticity</li>
                </ul>
                <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '8px', fontSize: '14px' }}>
                  ⚠️ <strong>Note:</strong> Only genuine wallets with transaction
                  history will be approved. Bots will be filtered.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setStep(2)}>
                  Next &gt;
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Tasks */}
          {step === 2 && (
            <div>
              <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
                Complete tasks below to proceed:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* X Username */}
                <div className="win95-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>
                    Your X Username:
                  </div>
                  <input
                    type="text"
                    className="win95-panel"
                    placeholder="@username"
                    value={xUsername}
                    onChange={(e) => setXUsername(e.target.value)}
                    style={{ flex: 1, padding: '4px', fontSize: '14px', border: 'none', outline: 'none', cursor: 'text', userSelect: 'text' }}
                  />
                </div>

                {/* Task 1: Follow */}
                <div className="win95-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
                  <input type="checkbox" checked={tasks.follow} onChange={() => {}} readOnly style={{ width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>1. Follow @MStick_NFT on X</div>
                    <div style={{ fontSize: '13px', color: '#555' }}>Follow our official account</div>
                  </div>
                  {tasks.follow ? (
                    <div style={{ whiteSpace: 'nowrap', padding: '4px 12px', color: '#888', fontWeight: 'bold' }}>✓ Done</div>
                  ) : (
                    <button
                      className="win95-btn"
                      style={{ whiteSpace: 'nowrap', backgroundColor: '#000080', color: '#fff' }}
                      onClick={() => { openLink('https://x.com/MStick_NFT'); completeTask('follow'); }}
                    >
                      Follow →
                    </button>
                  )}
                </div>

                {/* Task 2: Like & RT */}
                <div className="win95-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
                  <input type="checkbox" checked={tasks.like_rt} onChange={() => {}} readOnly style={{ width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>2. Like and Retweet the tweet</div>
                    <div style={{ fontSize: '13px', color: '#555' }}>Like and RT our latest post</div>
                  </div>
                  {tasks.like_rt ? (
                    <div style={{ whiteSpace: 'nowrap', padding: '4px 12px', color: '#888', fontWeight: 'bold' }}>✓ Done</div>
                  ) : (
                    <button
                      className="win95-btn"
                      style={{ whiteSpace: 'nowrap', backgroundColor: '#000080', color: '#fff' }}
                      onClick={() => { openLink(tweetLink); completeTask('like_rt'); }}
                    >
                      Like & RT →
                    </button>
                  )}
                </div>

                {/* Task 3: Comment */}
                <div className="win95-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>3. Comment on the tweet</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="win95-btn"
                      style={{ whiteSpace: 'nowrap', backgroundColor: '#000080', color: '#fff' }}
                      onClick={() => openLink(tweetLink)}
                    >
                      Open Post →
                    </button>
                    <input
                      type="text"
                      className="win95-panel"
                      placeholder="Paste your comment link here..."
                      value={commentLink}
                      onChange={(e) => setCommentLink(e.target.value)}
                      style={{ flex: 1, padding: '4px', fontSize: '14px', border: 'none', outline: 'none', cursor: 'text', userSelect: 'text' }}
                    />
                  </div>
                  {commentLink && !isValidCommentLink(commentLink) && (
                    <div style={{ color: 'red', fontSize: '12px' }}>
                      ⚠️ Please paste a valid x.com or twitter.com link
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setStep(1)}>
                  &lt; Back
                </button>
                <button
                  className="win95-btn"
                  style={{ padding: '4px 20px', opacity: allTasksDone ? 1 : 0.5, cursor: allTasksDone ? 'pointer' : 'not-allowed' }}
                  onClick={() => allTasksDone && setStep(3)}
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Wallet */}
          {step === 3 && (
            <div>
              <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>Submit your EVM Wallet Address:</p>
              <div className="win95-panel" style={{ padding: '15px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '15px' }}>
                  Enter your EVM-compatible wallet address (MetaMask, Phantom EVM, etc).
                </p>
                <input
                  type="text"
                  className="win95-panel"
                  placeholder="0x..."
                  value={wallet}
                  onChange={(e) => { setWallet(e.target.value); setWalletError(''); }}
                  style={{ width: '100%', padding: '10px', fontSize: '15px', border: 'none', outline: 'none', cursor: 'text', userSelect: 'text', marginBottom: '8px', boxSizing: 'border-box' }}
                />
                {walletError && (
                  <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>{walletError}</div>
                )}
                <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '8px', fontSize: '14px', marginTop: '10px' }}>
                  🔍 Your wallet will be scanned for activity to filter bots. Burner/empty wallets will not qualify.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setStep(2)}>
                  &lt; Back
                </button>
                <button
                  className="win95-btn"
                  style={{ padding: '4px 20px' }}
                  onClick={() => { if (validateWallet()) setStep(4); }}
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Submit */}
          {step === 4 && !submitted && (
            <div>
              <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>Review & Submit Application:</p>
              <div className="win95-panel" style={{ padding: '15px', marginBottom: '15px' }}>
                <table style={{ width: '100%', fontSize: '15px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold', width: '50%' }}>Round:</td>
                      <td style={{ color: '#000080', fontWeight: 'bold' }}>{roundLabel}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Followed @MStick_NFT:</td>
                      <td style={{ color: tasks.follow ? 'green' : 'red' }}>{tasks.follow ? '✓ Yes' : '✗ No'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Liked & Retweeted:</td>
                      <td style={{ color: tasks.like_rt ? 'green' : 'red' }}>{tasks.like_rt ? '✓ Yes' : '✗ No'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>X Username:</td>
                      <td style={{ wordBreak: 'break-all', fontSize: '13px' }}>{xUsername || '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Comment Link:</td>
                      <td style={{ wordBreak: 'break-all', fontSize: '13px' }}>{commentLink || '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>EVM Wallet:</td>
                      <td style={{ wordBreak: 'break-all', fontSize: '15px' }}>{wallet}</td>
                    </tr>
                  </tbody>
                </table>
                {submitError && (
                  <div style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px', backgroundColor: '#ffe6e6', padding: '8px', border: '1px solid red' }}>
                    {submitError}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="win95-btn" style={{ padding: '4px 20px' }} onClick={() => setStep(3)}>
                  &lt; Back
                </button>
                <button
                  className="win95-btn"
                  style={{ padding: '4px 20px', backgroundColor: '#000080', color: '#fff', fontWeight: 'bold', opacity: submitting ? 0.7 : 1 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '⌛ Submitting...' : '✓ Submit Application'}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎨</div>
              <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                {roundLabel}
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                Application Submitted!
              </p>
              <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                You are entry <strong>#{spotsUsed}</strong> out of {MAX_SPOTS} for this round.
              </p>
              <p style={{ fontSize: '13px', marginBottom: '15px' }}>
                Winners will be announced via <strong>@MStick_NFT</strong> on X.
                Follow us to stay updated!
              </p>
              <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '13px', backgroundColor: '#000', color: '#0f0', padding: '8px' }}>
                The OG Canvas. The OG Culture. 🖌️
              </p>
              <button className="win95-btn" style={{ marginTop: '15px', padding: '4px 20px' }} onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </>
      )}
    </DraggableWindow>
  );
};

export default WLWizard;
