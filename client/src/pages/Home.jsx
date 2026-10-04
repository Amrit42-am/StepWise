import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="container home-page fade-in">
      <div className="hero-section">
        <h1 className="hero-title">
          Learn the <span className="highlight-gradient">approach</span>, <br />
          not the answer.
        </h1>
        <p className="hero-subtitle">
          An AI-powered DSA mentor that guides you through reasoning stages and progressive hints, helping you build problem-solving skills without giving away the final solution.
        </p>
        
        <div className="modes-container">
          <div className="mode-card glass">
            <div className="mode-icon">🧠</div>
            <h3>Approach Mode</h3>
            <p>Paste a DSA problem and let the mentor guide your thought process stage by stage.</p>
            <ul className="mode-features">
              <li>✓ Understand the problem</li>
              <li>✓ Identify inputs/outputs</li>
              <li>✓ Find the bottleneck</li>
              <li>✓ Build the optimal approach</li>
            </ul>
            <Link to="/approach" className="btn mode-btn">Start Approach Mode</Link>
          </div>

          <div className="mode-card glass">
            <div className="mode-icon">💻</div>
            <h3>Code Hint Mode</h3>
            <p>Submit your code and get progressive hints on bugs, complexity, or edge cases.</p>
            <ul className="mode-features">
              <li>✓ Logical error identification</li>
              <li>✓ Complexity analysis</li>
              <li>✓ Edge case prompts</li>
              <li>✓ Progressive hint system</li>
            </ul>
            <Link to="/code-hint" className="btn mode-btn btn-outline">Start Code Hint Mode</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
