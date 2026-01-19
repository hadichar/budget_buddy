import { useState, useEffect } from 'react';
import { getTransactions } from '../api';

function TransactionList({ userId }) {
  const [transactions, setTransactions] = useState([]);  
  const [loading, setLoading] = useState(true);           

  useEffect(() => {
    loadTransactions();  
  }, [userId]);          

  async function loadTransactions() {
    try {
      const result = await getTransactions();
      
      if (result.ok) {
        const userTransactions = result.data.filter(transaction => {
          return transaction.user_id === userId;  
        });
        
        userTransactions.sort((transactionA, transactionB) => {
          const dateA = new Date(transactionA.transaction_date);  
          const dateB = new Date(transactionB.transaction_date);  
          return dateB - dateA;  
        });
        
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="transactions-container">
        <h2>My Transactions</h2>
        <p className="loading">No transactions yet. Add your first transaction!</p>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <h2>My Transactions</h2>
      
      {transactions.map(transaction => {
        const isIncome = transaction.transaction_type === 'income';
        
        const amount = parseFloat(transaction.amount).toFixed(2);
        
        const description = transaction.description || 'No description';
        
        return (
          <div key={transaction.transaction_id} className="transaction-item">
            <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? '+' : '-'}${amount}
            </div>
            
            <div className="transaction-info">
              <div><strong>{description}</strong></div>
              <div className="transaction-description">
                {transaction.transaction_date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;
