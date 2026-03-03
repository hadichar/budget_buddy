import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AccountCard({ account }) {
  const balance = parseFloat(account.balance || 0);
  const balanceColor = balance >= 0 ? '#28a745' : '#dc3545';
  
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{account.account_name || 'Unnamed Account'}</Text>
        <Text style={styles.details}>
          {account.bank_name || 'Unknown Bank'} • {account.account_type || 'Unknown Type'}
        </Text>
      </View>
      <Text style={[styles.balance, { color: balanceColor }]}>
        ${balance.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AccountCard;
