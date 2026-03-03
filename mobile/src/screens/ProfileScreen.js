import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccounts, getTransactions } from '../api';
import ScreenHeader from '../components/ScreenHeader';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileStats from '../components/ProfileStats';
import LogoutButton from '../components/LogoutButton';
import ErrorMessage from '../components/ErrorMessage';

function ProfileScreen({ onLogout }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({ accounts: 0, transactions: 0 });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadStats();
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

  async function loadStats() {
    try {
      const [{ data: allAccounts }, { data: allTransactions }] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      
      const userAccounts = allAccounts.filter(a => a.user_id === currentUser.user_id);
      const userTransactions = allTransactions.filter(t => t.user_id === currentUser.user_id);
      
      setStats({
        accounts: userAccounts.length,
        transactions: userTransactions.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('currentUser');
      Alert.alert('Success', 'Logged out successfully');
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout');
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
      <ScreenHeader title="My Profile" />

      <View style={styles.profileCard}>
        <ProfileAvatar username={currentUser.username} />
        <Text style={styles.username}>{currentUser.username}</Text>
        <Text style={styles.email}>{currentUser.email || 'No email'}</Text>
      </View>

      <ProfileStats 
        accounts={stats.accounts} 
        transactions={stats.transactions} 
      />

      <LogoutButton onPress={handleLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;
