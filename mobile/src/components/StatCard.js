import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

function StatCard({ title, value, subtitle, valueColor, clickable, onPress }) {
  const CardWrapper = clickable ? Pressable : View;
  
  return (
    <CardWrapper
      onPress={clickable ? onPress : undefined}
      style={[
        styles.card,
        clickable && styles.clickableCard,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: valueColor || '#667eea' }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  clickableCard: {
    // Additional styles for clickable cards if needed
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default StatCard;
