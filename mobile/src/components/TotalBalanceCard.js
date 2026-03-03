import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function TotalBalanceCard({ totalBalance }) {
  const balanceColor = totalBalance >= 0 ? '#28a745' : '#dc3545';
  
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={[styles.amount, { color: balanceColor }]}>
        ${totalBalance.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
});

export default TotalBalanceCard;
