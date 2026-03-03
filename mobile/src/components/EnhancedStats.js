import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { getAccounts, getTransactions } from '../api';
import StatCard from './StatCard';
import LoadingSpinner from './LoadingSpinner';

function EnhancedStats({ userId, navigation }) {
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
        const allAccounts = accountsResult.data;
        const userAccounts = [];
        for (let i = 0; i < allAccounts.length; i++) {
          if (allAccounts[i].user_id === userId) {
            userAccounts.push(allAccounts[i]);
          }
        }
        setAccounts(userAccounts);
      }

      if (transactionsResult.ok) {
        const allTransactions = transactionsResult.data;
        const userTransactions = [];
        for (let i = 0; i < allTransactions.length; i++) {
          if (allTransactions[i].user_id === userId) {
            userTransactions.push(allTransactions[i]);
          }
        }
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateTotalBalance() {
    let totalBalance = 0;
    for (let i = 0; i < accounts.length; i++) {
      const accountBalance = parseFloat(accounts[i].balance || 0);
      totalBalance = totalBalance + accountBalance;
    }
    return totalBalance;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalBalance = calculateTotalBalance();
  const accountsText = accounts.length === 1 ? 'account' : 'accounts';
  const transactionsText = transactions.length === 1 ? 'transaction' : 'transactions';
  const balanceSubtitle = totalBalance >= 0 
    ? 'Total balance across all accounts' 
    : 'Negative balance - review expenses';
  const balanceColor = totalBalance >= 0 ? '#28a745' : '#dc3545';

  return (
    <View style={styles.container}>
      <StatCard
        title="Total Accounts"
        value={accounts.length.toString()}
        subtitle={`${accountsText} • Tap to view`}
        clickable={true}
        onPress={() => navigation.navigate('Accounts')}
      />
      
      <StatCard
        title="Total Transactions"
        value={transactions.length.toString()}
        subtitle={`${transactionsText} • Tap to view`}
        clickable={true}
        onPress={() => navigation.navigate('Transactions')}
      />
      
      <StatCard
        title="Account Balance"
        value={`$${totalBalance.toFixed(2)}`}
        subtitle={balanceSubtitle}
        valueColor={balanceColor}
        clickable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default EnhancedStats;
