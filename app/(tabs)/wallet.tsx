import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';

export default function WalletScreen() {
  const transactions = [
    { id: 1, type: 'received', amount: 0.0001, date: '2024-01-20' },
    { id: 2, type: 'sent', amount: 0.00005, date: '2024-01-19' },
  ];

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Wallet</Text>

      <View style={[globalStyles.card, { alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#666' }}>Balance</Text>
        <Text style={{ fontSize: 32, fontWeight: 'bold', marginVertical: 10 }}>
          ₿ 0.0001
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Receive</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[globalStyles.title, { fontSize: 20, marginTop: 20 }]}>
        Recent Transactions
      </Text>

      <ScrollView>
        {transactions.map(tx => (
          <View key={tx.id} style={globalStyles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {tx.type === 'received' ? '📥 Received' : '📤 Sent'}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600',
                color: tx.type === 'received' ? 'green' : 'red'
              }}>
                {tx.type === 'received' ? '+' : '-'} ₿ {tx.amount}
              </Text>
            </View>
            <Text style={{ color: '#666', marginTop: 5 }}>{tx.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}