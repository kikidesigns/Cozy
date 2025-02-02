import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { globalStyles } from '../../constants/styles';

export default function HomeScreen() {
  return (
    <View style={globalStyles.container}>
      <View style={{ position: 'absolute', top: 40, left: 20 }}>
        <TouchableOpacity>
          <Text style={{ fontSize: 40 }}>👤</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ position: 'absolute', top: 40, right: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>₿ 0.0001</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 100 }}>🤖</Text>
        <Text style={{ fontSize: 24, marginTop: 20 }}>Your Agent</Text>
      </View>

      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
      }}>
        <TextInput
          style={globalStyles.input}
          placeholder="Chat with your agent..."
        />
      </View>
    </View>
  );
}