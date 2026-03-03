import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TransactionList from '../components/TransactionList';
import ScreenHeader from '../components/ScreenHeader';
import ErrorMessage from '../components/ErrorMessage';

function TransactionsScreen() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

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

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="Please log in to continue" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My Transactions" />
      <TransactionList userId={currentUser.user_id} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default TransactionsScreen;
