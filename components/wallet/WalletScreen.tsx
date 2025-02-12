import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useWallet } from '../../hooks/useWallet';

export function WalletScreen() {
  const { balanceSats, btcPrice, status, transactions, sendPayment, createInvoice } = useWallet();
  const [isReceiving, setIsReceiving] = useState(false);

  const handleSend = async () => {
    // TODO: Implement send flow with proper UI
    console.log('Send payment');
  };

  const handleReceive = async () => {
    setIsReceiving(true);
    try {
      // TODO: Implement receive flow with proper UI
      const invoice = await createInvoice(0); // Amount will be set in UI
      console.log('Created invoice:', invoice);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>{balanceSats} sats</Text>
        <Text style={styles.balanceUsd}>
          ${((balanceSats * btcPrice) / 100000000).toFixed(2)} USD
        </Text>
        <Text style={styles.status}>Status: {status}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.sendButton]}
          onPress={handleSend}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.receiveButton]}
          onPress={handleReceive}
          disabled={isReceiving}
        >
          <Text style={styles.buttonText}>
            {isReceiving ? 'Creating Invoice...' : 'Receive'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.transactions}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.transaction}>
            <Text style={styles.txType}>{tx.type}</Text>
            <Text style={styles.txAmount}>{tx.amountSats} sats</Text>
            <Text style={styles.txStatus}>{tx.status}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  balanceUsd: {
    fontSize: 18,
    color: '#666',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  receiveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactions: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  txType: {
    textTransform: 'capitalize',
    fontSize: 16,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  txStatus: {
    fontSize: 14,
    color: '#666',
  },
});