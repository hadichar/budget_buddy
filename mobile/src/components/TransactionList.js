import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getTransactions } from '../api';
import TransactionItem from './TransactionItem';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

function TransactionList({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
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
    return <LoadingSpinner message="Loading transactions..." />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState 
        title="No transactions yet" 
        message="Add your first transaction to get started!" 
      />
    );
  }

  const transactionsText = transactions.length === 1 ? 'transaction' : 'transactions';

  return (
    <View style={styles.container}>
      <Text style={styles.summary}>
        Showing {transactions.length} {transactionsText}
      </Text>
      
      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        keyExtractor={(item) => item.transaction_id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summary: {
    color: '#666',
    marginBottom: 16,
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default TransactionList;
