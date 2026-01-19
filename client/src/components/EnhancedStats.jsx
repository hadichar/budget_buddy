// Enhanced Stats Component - Makes the dashboard stats more user-friendly
// This component enhances the existing stats with React for better interactivity

import { useState, useEffect } from 'react';
import { getAccounts, getTransactions } from '../api';

function EnhancedStats({ userId }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  async function loadData() {
    try {
      const accountsResult = await getAccounts();
      const transactionsResult = await getTransactions();

      if (accountsResult.ok) {
        const userAccounts = accountsResult.data.filter(acc => acc.user_id === userId);
        setAccounts(userAccounts);
      }

      if (transactionsResult.ok) {
        const userTransactions = transactionsResult.data.filter(t => t.user_id === userId);
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Accounts</h3>
          <p>Loading...</p>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p>Loading...</p>
        </div>
        <div className="stat-card">
          <h3>Account Balance</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div 
        className="stat-card" 
        style={{ 
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={() => {
          // Navigate to accounts page
          if (window.showScreen) {
            window.showScreen('accounts');
          }
        }}
        title="Click to view all accounts"
      >
        <h3>Total Accounts</h3>
        <p style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#667eea',
          margin: '0.5rem 0'
        }}>
          {accounts.length}
        </p>
        <small style={{ color: '#666', fontSize: '0.9rem' }}>
          {accounts.length === 1 ? 'account' : 'accounts'} • Click to view
        </small>
      </div>
      
      <div 
        className="stat-card" 
        style={{ 
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={() => {
          // Navigate to transactions page
          if (window.showScreen) {
            window.showScreen('transactions');
          }
        }}
        title="Click to view all transactions"
      >
        <h3>Total Transactions</h3>
        <p style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#667eea',
          margin: '0.5rem 0'
        }}>
          {transactions.length}
        </p>
        <small style={{ color: '#666', fontSize: '0.9rem' }}>
          {transactions.length === 1 ? 'transaction' : 'transactions'} • Click to view
        </small>
      </div>
      
      <div 
        className="stat-card" 
        style={{ 
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onClick={() => {
          // Navigate to profile page (where account balance info is shown)
          if (window.showScreen) {
            window.showScreen('profile');
          }
        }}
        title="Click to view account balance details"
      >
        <h3>Account Balance</h3>
        <p style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: totalBalance >= 0 ? '#28a745' : '#dc3545',
          margin: '0.5rem 0'
        }}>
          ${totalBalance.toFixed(2)}
        </p>
        <small style={{ color: '#666', fontSize: '0.9rem' }}>
          {totalBalance >= 0 ? 'positive balance' : 'negative balance'} • Click to view
        </small>
      </div>
    </div>
  );
}

export default EnhancedStats;
