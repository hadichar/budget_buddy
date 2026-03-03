import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ChatMessage({ message, isUser }) {
  return (
    <View style={[styles.container, isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
});

export default ChatMessage;
