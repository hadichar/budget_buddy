import { useState, useEffect } from 'react';
import { getAccounts, getTransactions } from '../api';
import StatCard from './StatCard';

function DashboardStats({ userId }) {

  const [accounts, setAccounts] = useState([]);           
  const [transactions, setTransactions] = useState([]);     
  const [loading, setLoading] = useState(true);            

  useEffect(() => {
    loadData();  
  }, [userId]);  

  async function loadData() {
    try {
      const accountsResult = await getAccounts();
      const transactionsResult = await getTransactions();

      if (accountsResult.ok) {
        const userAccounts = accountsResult.data.filter(account => account.user_id === userId);
        
        setAccounts(userAccounts);
      }

      if (transactionsResult.ok) {
        const userTransactions = transactionsResult.data.filter(transaction => transaction.user_id === userId);
        
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = accounts.reduce((sum, account) => {
    const accountBalance = parseFloat(account.balance || 0);  
    return sum + accountBalance;  
  }, 0);  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="stats-container">
      <StatCard 
        title="Total Accounts" 
        value={accounts.length}  
      />
      
      <StatCard 
        title="Total Transactions" 
        value={transactions.length}  
      />
      
      <StatCard 
        title="Account Balance" 
        value={`$${totalBalance.toFixed(2)}`}  
      />
    </div>
  );
}

export default DashboardStats;
