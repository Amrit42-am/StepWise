import { useState } from 'react';
import ChatBox from '../components/ChatBox';
import { codeAPI } from '../services/api';
import './ModeStyles.css';

import { useAuth } from '../context/AuthContext';

const CodeHintMode = () => {
  const { user } = useAuth();
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!problem.trim() || !code.trim()) return;

    setIsLoading(true);
    try {
      const res = await codeAPI.analyze(problem, code, language);
      setSessionId(res.data.sessionId);
      setHintLevel(res.data.hintLevel);
      setConversation([
        { role: 'user', content: `My code:\n\`\`\`${language}\n${code}\n\`\`\`` },
        { role: 'assistant', content: res.data.hint }
      ]);
    } catch (error) {
      console.error('Error starting code review:', error);
      alert('Failed to start code review.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !code.trim()) || !sessionId) return;

    const userMessage = input || "Here is my updated code. Please check it.";
    setInput('');
    setConversation(prev => [...prev, { 
      role: 'user', 
      content: `${userMessage}\n\nUpdated code:\n\`\`\`${language}\n${code}\n\`\`\`` 
    }]);
    setIsLoading(true);

    try {
      const res = await codeAPI.nextHint(sessionId, userMessage, code);
      setConversation(prev => [...prev, { role: 'assistant', content: res.data.hint }]);
      setHintLevel(res.data.hintLevel);
    } catch (error) {
      console.error('Error getting next code hint:', error);
      alert('Failed to get next hint.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="mode-header">
        <h2>Code Hint Mode</h2>
        <p>Submit your solution and receive feedback without getting the exact answer.</p>
      </div>

      {!user ? (
        <p className="profile-required glass">Please login or register to save your learning history.</p>
      ) : !sessionId ? (
        <div className="input-section glass">
          <form onSubmit={handleStart}>
            <label htmlFor="problem">Problem Statement:</label>
            <textarea
              id="problem"
              rows="3"
              placeholder="e.g. Find the missing number in an array of 1 to N."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
            />

            <label htmlFor="language">Language:</label>
            <select 
              id="language" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <label htmlFor="code">Your Code:</label>
            <textarea
              id="code"
              className="code-textarea"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'Analyzing Code...' : 'Analyze Code'}
            </button>
          </form>
        </div>
      ) : (
        <div className="two-column-layout">
          <div className="code-editor-panel glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'white' }}>Editor</h3>
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Update your code here and ask for another review.
            </p>
          </div>
          
          <div className="chat-section" style={{ margin: 0, maxWidth: 'none' }}>
            <div className="status-bar">
              <span>Hint Level: {hintLevel} / 5</span>
              {hintLevel >= 5 && <span className="warning-text">Max hint level reached</span>}
            </div>
            
            <ChatBox conversation={conversation} isTyping={isLoading} />
            
            <form className="chat-input-form" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask a question or request code review..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || hintLevel >= 5}
              />
              <button type="submit" className="btn" disabled={isLoading || hintLevel >= 5}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeHintMode;
