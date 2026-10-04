import { useEffect, useState } from 'react';
import { sessionAPI } from '../services/api';
import './History.css';

import { useAuth } from '../context/AuthContext';

const History = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (!user) return;

    sessionAPI.getSessions()
      .then(({ data }) => setSessions(data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'History could not be loaded.'))
  }, [user]);

  const isLoading = sessions === null && !error;

  if (!user) {
    return <div className="container history-page"><p className="empty-history glass">Please login to view your learning history.</p></div>;
  }

  return (
    <div className="container history-page fade-in">
      <div className="mode-header">
        <h2>{user.username}'s History</h2>
        <p>Your Approach Mode and Code Hint Mode conversations are saved here.</p>
      </div>
      {isLoading && <p className="history-status">Loading saved sessions…</p>}
      {error && <p className="history-status error-text" role="alert">{error}</p>}
      {!isLoading && !error && sessions.length === 0 && <p className="empty-history glass">No sessions yet. Start a learning mode and it will appear here.</p>}
      <div className="history-layout">
        <div className="history-list" aria-label="Saved learning sessions">
          {(sessions || []).map((session) => (
            <button
              type="button"
              key={session._id}
              className={`history-item glass ${selectedSession?._id === session._id ? 'selected' : ''}`}
              onClick={() => setSelectedSession(session)}
            >
              <span className="history-mode">{session.mode === 'code' ? 'Code hint' : 'Approach'}</span>
              <strong>{session.problem}</strong>
              <span>{new Date(session.updatedAt).toLocaleString()}</span>
            </button>
          ))}
        </div>
        <section className="history-detail glass" aria-live="polite">
          {!selectedSession ? <p>Select a session to read the full conversation.</p> : (
            <>
              <h3>{selectedSession.problem}</h3>
              <p className="history-detail-meta">Hint level {selectedSession.hintLevel} of 5 · {selectedSession.mode} mode</p>
              {selectedSession.conversation.map((message, index) => (
                <article key={`${message.timestamp}-${index}`} className={`history-message ${message.role}`}>
                  <strong>{message.role === 'assistant' ? 'StepWise' : user.username}</strong>
                  <p>{message.content}</p>
                </article>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default History;
