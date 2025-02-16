import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';

interface Transaction {
  id: number;
  type: 'received' | 'sent';
  amount: number;
  date: string;
  description?: string;
}

export default function WalletScreen() {
  const transactions: Transaction[] = [
    { 
      id: 1, 
      type: 'received', 
      amount: 0.0001, 
      date: '2024-01-20',
      description: 'Payment received for task completion'
    },
    { 
      id: 2, 
      type: 'sent', 
      amount: 0.00005, 
      date: '2024-01-19',
      description: 'Lightning Network payment'
    },
    { 
      id: 3, 
      type: 'received', 
      amount: 0.00015, 
      date: '2024-01-18',
      description: 'Nostr zap received'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <Text style={[globalStyles.title, styles.title]}>Wallet</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>
            ₿ 0.0001
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.sendButton]}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.receiveButton]}>
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Recent Transactions
        </Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {transactions.map(tx => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {tx.type === 'received' ? '📥 Received' : '📤 Sent'}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    tx.type === 'received' ? styles.receivedAmount : styles.sentAmount
                  ]}>
                    {tx.type === 'received' ? '+' : '-'} ₿ {tx.amount}
                  </Text>
                </View>
              </View>
              {tx.description && (
                <Text style={styles.transactionDescription}>
                  {tx.description}
                </Text>
              )}
              <Text style={styles.transactionDate}>{tx.date}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  container: {
    padding: 20,
  },
  title: {
    color: Colors.darkOrangeBrown,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: Colors.orangeBrown,
  },
  receiveButton: {
    backgroundColor: Colors.sageGreen,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    marginBottom: 8,
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  receivedAmount: {
    color: Colors.sageGreen,
  },
  sentAmount: {
    color: Colors.orangeBrown,
  },
  transactionDescription: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.softGray,
  },
});