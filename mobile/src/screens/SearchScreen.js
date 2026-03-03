import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGoals } from '../api';
import ScreenHeader from '../components/ScreenHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function SearchScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGoals();
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

  async function loadGoals() {
    try {
      if (!currentUser) return;
      
      const result = await getGoals(currentUser.user_id);
      
      if (result.ok) {
        setGoals(result.data || []);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  function filterGoals() {
    if (!searchQuery.trim()) {
      return goals;
    }

    const searchText = searchQuery.toLowerCase();
    const filteredList = [];
    
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      const goalName = (goal.goal_name || '').toLowerCase();
      const goalType = (goal.goal_type || '').toLowerCase();
      const goalPeriod = (goal.period || '').toLowerCase();
      
      if (goalName.includes(searchText) || 
          goalType.includes(searchText) || 
          goalPeriod.includes(searchText)) {
        filteredList.push(goal);
      }
    }
    
    return filteredList;
  }

  function formatCurrency(amount) {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  }

  function getGoalTypeLabel(type) {
    if (type === 'spending_limit') return 'Spending Limit';
    if (type === 'savings_target') return 'Savings Target';
    return type;
  }

  function getStatusColor(goal) {
    const currentAmount = parseFloat(goal.current_amount || 0);
    const targetAmount = parseFloat(goal.target_amount || 0);
    
    if (goal.is_over_budget) {
      return '#dc3545';
    }
    
    let percentage = 0;
    if (targetAmount > 0) {
      percentage = (currentAmount / targetAmount) * 100;
    }
    
    if (percentage >= 80) {
      return '#ffc107';
    }
    
    return '#28a745';
  }

  function renderGoal({ item }) {
    const currentAmount = parseFloat(item.current_amount || 0);
    const targetAmount = parseFloat(item.target_amount || 0);
    
    let percentage = 0;
    if (targetAmount > 0) {
      percentage = (currentAmount / targetAmount) * 100;
      if (percentage > 100) {
        percentage = 100;
      }
    }
    
    const statusColor = getStatusColor(item);

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalName}>{item.goal_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.is_over_budget ? 'Over Budget' : `${percentage.toFixed(0)}%`}
            </Text>
          </View>
        </View>
        
        <View style={styles.goalDetails}>
          <Text style={styles.goalType}>{getGoalTypeLabel(item.goal_type)}</Text>
          <Text style={styles.goalPeriod}>{item.period}</Text>
        </View>
        
        <View style={styles.goalAmounts}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Current:</Text>
            <Text style={styles.amountValue}>{formatCurrency(currentAmount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Target:</Text>
            <Text style={styles.amountValue}>{formatCurrency(targetAmount)}</Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${percentage}%`, 
                backgroundColor: statusColor 
              }
            ]} 
          />
        </View>
      </View>
    );
  }

  const filteredGoals = filterGoals();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading budgeting plans..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Search Budget Plans" />
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, type, or period..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {filteredGoals.length === 0 ? (
        <EmptyState 
          title={searchQuery ? "No plans found" : "No budgeting plans"} 
          message={searchQuery ? "Try a different search term" : "Create your first budgeting plan to get started!"} 
        />
      ) : (
        <FlatList
          data={filteredGoals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.goal_id.toString()}
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  goalType: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  goalPeriod: {
    fontSize: 14,
    color: '#666',
  },
  goalAmounts: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default SearchScreen;
