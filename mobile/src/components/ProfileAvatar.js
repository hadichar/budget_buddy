import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ProfileAvatar({ username }) {
  const initial = username ? username.charAt(0).toUpperCase() : 'U';
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProfileAvatar;
