import React from "react"
import {
    ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native"
import { Colors } from "@/constants/Colors"
import { useWallet } from "@/hooks/useWallet"

export default function WalletScreen() {
  const {
    isInitialized,
    balance,
    transactions,
    error,
    isLoading,
    refreshData,
    sendPayment,
    receivePayment
  } = useWallet();

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.orangeBrown} />
        <Text style={styles.loadingText}>Initializing wallet...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refreshData}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSend = () => {
    // TODO: Implement send flow
    console.log('Send pressed');
  };

  const handleReceive = () => {
    // TODO: Implement receive flow
    console.log('Receive pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₿ {balance.balanceSat / 100000000}</Text>
        {balance.pendingSendSat > 0 && (
          <Text style={styles.pendingText}>Pending send: ₿ {balance.pendingSendSat / 100000000}</Text>
        )}
        {balance.pendingReceiveSat > 0 && (
          <Text style={styles.pendingText}>Pending receive: ₿ {balance.pendingReceiveSat / 100000000}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.sendButton]}
          onPress={handleSend}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.receiveButton]}
          onPress={handleReceive}
        >
          <Text style={styles.buttonText}>Receive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <ScrollView>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transaction}>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>
                  {tx.type === 'receive' ? '⬇️ Received' : '⬆️ Sent'}
                </Text>
                <Text style={styles.txDetails}>
                  {tx.description || 'No description'}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.timestamp * 1000).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.type === 'receive' ? styles.received : styles.sent
                ]}
              >
                {tx.type === 'receive' ? '+' : '-'} ₿ {tx.amount / 100000000}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 20,
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
  pendingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
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
