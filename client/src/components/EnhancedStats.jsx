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
        const userAccounts = accountsResult.data.filter(account => {
          return account.user_id === userId;
        });
        
        setAccounts(userAccounts);
      }

      if (transactionsResult.ok) {
        const userTransactions = transactionsResult.data.filter(transaction => {
          return transaction.user_id === userId;
        });
        
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = accounts.reduce((sum, account) => {
    const accountBalance = parseFloat(account.balance || 0);
    return sum + accountBalance;
  }, 0);

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
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onClick={() => {
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
