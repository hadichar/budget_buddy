import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccounts, getTransactions } from '../api';
import ScreenHeader from '../components/ScreenHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import AIResponse from '../components/AIResponse';

function AIChatScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser && messages.length === 0) {
      addMessage('Hello! I\'m your AI financial assistant. Ask me about your finances, get budgeting tips, or request insights about your spending habits!', 'ai');
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

  function addMessage(text, sender) {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  async function sendMessage() {
    if (!inputText.trim() || !currentUser) return;
    
    const userMessage = inputText.trim();
    addMessage(userMessage, 'user');
    setInputText('');
    
    const aiResponse = await generateAIResponse(userMessage);
    setTimeout(() => {
      addMessage(aiResponse, 'ai');
    }, 500);
  }

  async function generateAIResponse(userMessage) {
    try {
      const transactionsResult = await getTransactions();
      const accountsResult = await getAccounts();
      
      const allTransactions = transactionsResult.data;
      const allAccounts = accountsResult.data;
      
      const userTransactions = [];
      for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].user_id === currentUser.user_id) {
          userTransactions.push(allTransactions[i]);
        }
      }
      
      const userAccounts = [];
      for (let i = 0; i < allAccounts.length; i++) {
        if (allAccounts[i].user_id === currentUser.user_id) {
          userAccounts.push(allAccounts[i]);
        }
      }
      
      let totalBalance = 0;
      for (let i = 0; i < userAccounts.length; i++) {
        const balance = parseFloat(userAccounts[i].balance || 0);
        totalBalance = totalBalance + balance;
      }
      
      const expenses = [];
      const income = [];
      for (let i = 0; i < userTransactions.length; i++) {
        if (userTransactions[i].transaction_type === 'expense') {
          expenses.push(userTransactions[i]);
        } else if (userTransactions[i].transaction_type === 'income') {
          income.push(userTransactions[i]);
        }
      }
      
      let totalExpenses = 0;
      for (let i = 0; i < expenses.length; i++) {
        const amount = parseFloat(expenses[i].amount || 0);
        totalExpenses = totalExpenses + amount;
      }
      
      let totalIncome = 0;
      for (let i = 0; i < income.length; i++) {
        const amount = parseFloat(income[i].amount || 0);
        totalIncome = totalIncome + amount;
      }
      
      const userData = {
        accounts: userAccounts,
        transactions: userTransactions,
        totalBalance: totalBalance,
        totalExpenses: totalExpenses,
        totalIncome: totalIncome,
        expenses: expenses,
        income: income,
      };
      
      return AIResponse(userMessage, userData);
    } catch (error) {
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="AI Financial Assistant" 
        subtitle="Ask me anything about your finances" 
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <ChatMessage message={item.text} isUser={item.sender === 'user'} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={sendMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
});

export default AIChatScreen;
