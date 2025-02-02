import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../constants/styles';

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'received', amount: 500, date: '2024-01-20', from: 'Alice' },
  { id: 2, type: 'sent', amount: 200, date: '2024-01-19', to: 'Bob' },
  { id: 3, type: 'received', amount: 1000, date: '2024-01-18', from: 'Charlie' },
];

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₿ 1,234</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.sendButton]}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.receiveButton]}>
          <Text style={styles.buttonText}>Receive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <ScrollView>
          {MOCK_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.transaction}>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>
                  {tx.type === 'received' ? '⬇️ Received' : '⬆️ Sent'}
                </Text>
                <Text style={styles.txDetails}>
                  {tx.type === 'received' ? `From ${tx.from}` : `To ${tx.to}`}
                </Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text 
                style={[
                  styles.txAmount,
                  tx.type === 'received' ? styles.received : styles.sent
                ]}
              >
                {tx.type === 'received' ? '+' : '-'} ₿ {tx.amount}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  balanceContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  balanceLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '40%',
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
  },
  receiveButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txDetails: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  txDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  received: {
    color: '#4ECDC4',
  },
  sent: {
    color: '#FF6B6B',
  },
});