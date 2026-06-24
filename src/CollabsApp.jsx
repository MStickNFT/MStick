import { useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1gQ5zJ3udqp3hGFm4sO_7AaH75ClxieeHfQLnXU1wswc/export?format=csv&gid=0';

// Parse raw CSV text into array of objects
const parseCSV = (text) => {
  const lines = text.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const collabs = [];

  lines.slice(1).forEach(line => {
    // Split carefully by comma but preserve commas inside quotes
    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || line.split(',');
    const cleaned = cols.map(c => (c || '').replace(/^"|"$/g, '').replace(/\r/g, '').trim());

    const community = cleaned[0] || '';
    const xLink     = cleaned[1] || '';
    const spots     = parseInt(cleaned[2]) || 0;
    const status    = cleaned[3] || '';
    const collabType= cleaned[4] || '';

    if (community && community !== 'Community') {
      collabs.push({ community, xLink, spots, status, collabType });
    }
  });

  return collabs;
};

// Status badge color mapping
const getStatusStyle = (status) => {
  if (status === 'Winners Received') {
    return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
  } else {
    return { bg: '#fff3cd', color: '#856404', border: '#ffc107' };
  }
};

const CollabsApp = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error('Failed to fetch sheet');
      const text = await res.text();
      const parsed = parseCSV(text);
      setCollabs(parsed);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (_e) {
      setError('Could not load sheet. Make sure it is published publicly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = filterStatus === 'All'
    ? collabs
    : collabs.filter(c => c.status === filterStatus);

  // Stats calculation based on your actual lore/supply
  const MAX_COLLAB_SPOTS = 1786;
  const WEBSITE_SPOTS = 80;
  const X_SPOTS = 80;
  const TEAM_SPOTS = 39;
  
  const totalSpotsGiven = collabs.reduce((a, c) => a + (c.spots || 0), 0);
  const spotsRemaining = MAX_COLLAB_SPOTS - totalSpotsGiven;
  const totalCollabs = collabs.length;
  
  const winnersReceivedCount = collabs.filter(c => c.status === 'Winners Received').length;
  const needWinnersCount = collabs.filter(c => c.status === 'Need Winners').length;

  const STATUSES = ['All', 'Winners Received', 'Need Winners'];

  return (
    <DraggableWindow
      title="COLLABS.EXE — Transparency Ledger"
      initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth/2 - 500 : 100, y: typeof window !== 'undefined' ? window.innerHeight/2 - 350 : 100 }}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
      style={{ width: '1000px', height: '700px' }}
    >
      <div style={{ backgroundColor: 'var(--win95-gray)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', boxSizing: 'border-box' }}>

        {/* Global Supply Stats (Your 1,985 Breakdown) */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
           <div className="win95-panel" style={{ flex: 1, padding: '6px 10px', fontSize: '13px', backgroundColor: '#000080', color: '#fff' }}>
            <strong>Supply:</strong> 1,985
          </div>
          <div className="win95-panel" style={{ flex: 1, padding: '6px 10px', fontSize: '13px', backgroundColor: '#000080', color: '#fff' }}>
            <strong>Website:</strong> {WEBSITE_SPOTS}
          </div>
          <div className="win95-panel" style={{ flex: 1, padding: '6px 10px', fontSize: '13px', backgroundColor: '#000080', color: '#fff' }}>
            <strong>X Supporters:</strong> {X_SPOTS}
          </div>
          <div className="win95-panel" style={{ flex: 1, padding: '6px 10px', fontSize: '13px', backgroundColor: '#000080', color: '#fff' }}>
            <strong>Team:</strong> {TEAM_SPOTS}
          </div>
          <div className="win95-panel" style={{ flex: 1, padding: '6px 10px', fontSize: '13px', backgroundColor: '#000080', color: '#fff' }}>
            <strong>Collabs:</strong> {MAX_COLLAB_SPOTS}
          </div>
        </div>

        {/* Collab Live Stats */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Collabs', value: loading ? '…' : totalCollabs },
            { label: 'Collab Spots Given', value: loading ? '…' : totalSpotsGiven },
            { label: 'Collab Spots Remaining', value: loading ? '…' : spotsRemaining, color: spotsRemaining > 0 ? '#000080' : 'red' },
            { label: 'Winners Received', value: loading ? '…' : winnersReceivedCount },
            { label: 'Need Winners', value: loading ? '…' : needWinnersCount },
          ].map(s => (
            <div key={s.label} className="win95-panel" style={{ flex: '1 1 150px', padding: '10px 14px', fontSize: '15px', minWidth: '120px', color: s.color || '#000' }}>
              <strong>{s.label}:</strong> {s.value}
            </div>
          ))}
        </div>

        {/* Filter + Refresh bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Filter:</span>
          {STATUSES.map(s => (
            <button
              key={s}
              className="win95-btn"
              style={{
                padding: '4px 14px',
                fontSize: '13px',
                boxShadow: filterStatus === s ? 'var(--border-inset)' : 'var(--border-outset)',
              }}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {lastUpdated && <span style={{ fontSize: '13px', color: '#555' }}>Updated: {lastUpdated}</span>}
          <button className="win95-btn" style={{ padding: '4px 14px', fontSize: '13px' }} onClick={fetchData}>
            Refresh
          </button>
        </div>

        {/* Table area */}
        <div className="win95-panel" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '16px', color: '#555' }}>
              ⏳ Loading live ledger...
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
              <span style={{ fontSize: '16px', color: 'red' }}>⚠️ {error}</span>
              <button className="win95-btn" onClick={fetchData} style={{ padding: '6px 20px', fontSize: '14px' }}>Retry</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#000080', color: '#fff', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Community</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Spots</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((collab, i) => {
                  const s = getStatusStyle(collab.status);
                  return (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px 14px', color: '#888', fontSize: '13px' }}>{i + 1}</td>
                      <td style={{ padding: '8px 14px', fontWeight: 'bold' }}>
                        {collab.xLink ? (
                          <a href={collab.xLink} target="_blank" rel="noopener noreferrer" style={{ color: '#000080', textDecoration: 'none' }}>
                            {collab.community}
                          </a>
                        ) : collab.community}
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>{collab.spots || '—'}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'center', fontSize: '13px', color: '#555' }}>{collab.collabType}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                          fontSize: '13px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}>
                          {collab.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '15px' }}>No collabs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#fffbe6', border: '1px solid #000', padding: '8px 12px', fontSize: '13px' }}>
          <strong>Transparency Notice:</strong> Live data pulled from the MStick collab ledger. Every spot is tracked. All WL is guaranteed mint.
        </div>

      </div>
    </DraggableWindow>
  );
};

export default CollabsApp;
