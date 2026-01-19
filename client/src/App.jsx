
import { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import TransactionList from './components/TransactionList';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

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
          Please log in using the original app first, then refresh this page.
        </div>
        <p style={{ marginTop: '20px', color: '#666' }}>
          This React app enhances the dashboard view. Use the main app at http://localhost:3000 to log in first.
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>💰 BudgetBuddy+ Dashboard</h1>
      
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Welcome back, <strong>{currentUser.username}</strong>!
      </p>

      <DashboardStats userId={currentUser.user_id} />

      <TransactionList userId={currentUser.user_id} />
    </div>
  );
}

export default App;
