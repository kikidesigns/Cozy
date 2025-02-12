import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useWallet } from '@/hooks/useWallet';
import { Colors } from '../../constants/Colors';
import { globalStyles } from '../../constants/styles';

export default function WalletScreen() {
  const {
    balance,
    transactions,
    error,
    isLoading,
    refreshData,
    sendPayment,
    receivePayment
  } = useWallet();

  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Format balance for display
  const formatSats = (sats: number) => {
    return new Intl.NumberFormat().format(sats);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.sageGreen} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, styles.container]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>
          ₿ {formatSats(balance.balanceSat)}
        </Text>
        {(balance.pendingSendSat > 0 || balance.pendingReceiveSat > 0) && (
          <Text style={styles.pendingText}>
            {balance.pendingReceiveSat > 0 && `Receiving: ${formatSats(balance.pendingReceiveSat)} sats\n`}
            {balance.pendingSendSat > 0 && `Sending: ${formatSats(balance.pendingSendSat)} sats`}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => {
              // TODO: Show send modal
              console.log('Send pressed');
            }}
          >
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.receiveButton]}
            onPress={() => {
              // TODO: Show receive modal
              console.log('Receive pressed');
            }}
          >
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.sageGreen}
          />
        }
      >
        {transactions.length === 0 ? (
          <Text style={styles.noTransactionsText}>
            No transactions yet
          </Text>
        ) : (
          transactions.map(tx => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {tx.type === 'receive' ? '📥 Received' : '📤 Sent'}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    tx.type === 'receive' ? styles.receivedAmount : styles.sentAmount
                  ]}>
                    {tx.type === 'receive' ? '+' : '-'} {formatSats(tx.amount)} sats
                  </Text>
                </View>
              </View>
              {tx.description && (
                <Text style={styles.transactionDescription}>
                  {tx.description}
                </Text>
              )}
              <View style={styles.transactionFooter}>
                <Text style={styles.transactionDate}>
                  {formatDate(tx.timestamp)}
                </Text>
                {tx.status !== 'complete' && (
                  <Text style={[
                    styles.transactionStatus,
                    tx.status === 'pending' ? styles.pendingStatus : styles.failedStatus
                  ]}>
                    {tx.status.toUpperCase()}
                  </Text>
                )}
                {tx.fee && tx.fee > 0 && (
                  <Text style={styles.feeText}>
                    Fee: {tx.fee} sats
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.warmBeige,
  },
  errorContainer: {
    backgroundColor: Colors.error,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.white,
    textAlign: 'center',
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
  pendingText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
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
  noTransactionsText: {
    textAlign: 'center',
    color: Colors.text,
    opacity: 0.6,
    marginTop: 20,
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
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.softGray,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingStatus: {
    backgroundColor: Colors.warning + '20',
    color: Colors.warning,
  },
  failedStatus: {
    backgroundColor: Colors.error + '20',
    color: Colors.error,
  },
  feeText: {
    fontSize: 12,
    color: Colors.softGray,
  },
});