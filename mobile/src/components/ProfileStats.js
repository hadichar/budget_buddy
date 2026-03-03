import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ProfileStats({ accounts, transactions }) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.value}>{accounts}</Text>
        <Text style={styles.label}>Accounts</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.value}>{transactions}</Text>
        <Text style={styles.label}>Transactions</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileStats;
