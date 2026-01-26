import { useState, useEffect } from 'react';
import EnhancedStats from './components/EnhancedStats';
import TransactionList from './components/TransactionList';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('stats');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="app-container">
        <h1>💰 BudgetBuddy+</h1>
        <div className="error">
          Please log in using the main app first.
        </div>
      </div>
    );
  }

  const isIntegrated = document.getElementById('react-stats-container') !== null;

  if (isIntegrated) {
    return <EnhancedStats userId={currentUser.user_id} />;
  }

  return (
    <div className="app-container">
      <h1>💰 BudgetBuddy+ Dashboard</h1>
      
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Welcome back, <strong>{currentUser.username}</strong>!
      </p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setCurrentView('stats')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'stats' ? '#667eea' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Dashboard Stats
        </button>
        
        <button 
          onClick={() => setCurrentView('transactions')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'transactions' ? '#667eea' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Transactions
        </button>
      </div>

      {currentView === 'stats' && (
        <EnhancedStats userId={currentUser.user_id} />
      )}

      {currentView === 'transactions' && (
        <TransactionList userId={currentUser.user_id} />
      )}
    </div>
  );
}

export default App;
