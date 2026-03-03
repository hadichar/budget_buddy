import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedStats from '../components/EnhancedStats';
import ScreenHeader from '../components/ScreenHeader';
import ErrorMessage from '../components/ErrorMessage';

function DashboardScreen({ navigation }) {
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
      <View style={styles.header}>
        <Text style={styles.title}>BudgetBuddy+</Text>
        <Text style={styles.welcomeText}>Welcome back, {currentUser.username}!</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        <Text style={styles.sectionSubtitle}>Tap on any card below to view more details</Text>
        
        <EnhancedStats userId={currentUser.user_id} navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e7e7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});

export default DashboardScreen;
