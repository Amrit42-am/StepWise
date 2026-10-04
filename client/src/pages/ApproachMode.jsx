import { useState } from 'react';
import ChatBox from '../components/ChatBox';
import { approachAPI } from '../services/api';
import './ModeStyles.css';

import { useAuth } from '../context/AuthContext';

const ApproachMode = () => {
  const { user } = useAuth();
  const [problem, setProblem] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsLoading(true);
    try {
      const res = await approachAPI.start(problem);
      setSessionId(res.data.sessionId);
      setHintLevel(res.data.hintLevel);
      setConversation([
        { role: 'user', content: problem },
        { role: 'assistant', content: res.data.hint }
      ]);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start approach session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage = input;
    setInput('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await approachAPI.nextHint(sessionId, userMessage);
      setConversation(prev => [...prev, { role: 'assistant', content: res.data.hint }]);
      setHintLevel(res.data.hintLevel);
    } catch (error) {
      console.error('Error getting next hint:', error);
      alert('Failed to get next hint.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="mode-header">
        <h2>Approach Mode</h2>
        <p>Paste a DSA problem and learn how to break it down logically.</p>
      </div>

      {!user ? (
        <p className="profile-required glass">Please login or register to save your learning history.</p>
      ) : !sessionId ? (
        <div className="input-section glass">
          <form onSubmit={handleStart}>
            <label htmlFor="problem">Problem Statement:</label>
            <textarea
              id="problem"
              rows="6"
              placeholder="e.g. Given an array of integers and a target, return the indices of two numbers whose sum equals the target."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Start Guided Approach'}
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-section">
          <div className="status-bar">
            <span>Hint Level: {hintLevel} / 5</span>
            {hintLevel >= 5 && <span className="warning-text">Max hint level reached</span>}
          </div>
          
          <ChatBox conversation={conversation} isTyping={isLoading} />
          
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Your thought process or 'Next step please'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || hintLevel >= 5}
            />
            <button type="submit" className="btn" disabled={isLoading || !input.trim() || hintLevel >= 5}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApproachMode;
