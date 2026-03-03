import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccounts } from '../api';
import ScreenHeader from '../components/ScreenHeader';
import TotalBalanceCard from '../components/TotalBalanceCard';
import AccountCard from '../components/AccountCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function AccountsScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadAccounts();
    }
  }, [currentUser]);

  async function loadUser() {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function loadAccounts() {
    try {
      const result = await getAccounts();
      
      if (result.ok && currentUser) {
        const userAccounts = result.data.filter(account => {
          return account.user_id === currentUser.user_id;
        });
        setAccounts(userAccounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  function calculateTotalBalance() {
    let total = 0;
    for (let i = 0; i < accounts.length; i++) {
      total += parseFloat(accounts[i].balance || 0);
    }
    return total;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading accounts..." />
      </SafeAreaView>
    );
  }

  const totalBalance = calculateTotalBalance();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My Accounts" />

      <TotalBalanceCard totalBalance={totalBalance} />

      {accounts.length === 0 ? (
        <EmptyState 
          title="No accounts found" 
          message="Add your first account to get started!" 
        />
      ) : (
        <FlatList
          data={accounts}
          renderItem={({ item }) => <AccountCard account={item} />}
          keyExtractor={(item) => item.account_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});

export default AccountsScreen;
