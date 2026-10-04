import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ApproachMode from './pages/ApproachMode';
import CodeHintMode from './pages/CodeHintMode';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import './App.css'; 

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <nav className="navbar glass">
        <div className="container nav-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🧠</span> StepWise <span className="highlight">DSA</span>
          </Link>
          <div className="nav-links">
            <Link to="/approach" className="nav-link">Approach Mode</Link>
            <Link to="/code-hint" className="nav-link">Code Hint Mode</Link>
            {user && <Link to="/history" className="nav-link">My History</Link>}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <>
                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>Hi, {user.username}</span>
                <button 
                  onClick={logout}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                <Link to="/register" style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}>Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/approach" element={<ApproachMode />} />
          <Route path="/code-hint" element={<CodeHintMode />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>StepWise DSA - "Learn the approach, not the answer."</p>
      </footer>
    </div>
  );
}

export default App;
