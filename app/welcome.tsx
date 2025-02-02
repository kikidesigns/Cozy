import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { globalStyles } from '../constants/styles';

export default function WelcomeScreen() {
  const [npub, setNpub] = useState('');
  const [nsec, setNsec] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.replace('/(tabs)');
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to Cozy</Text>
      
      <TextInput
        style={globalStyles.input}
        placeholder="Enter npub"
        value={npub}
        onChangeText={setNpub}
      />
      
      <TextInput
        style={globalStyles.input}
        placeholder="Enter nsec"
        value={nsec}
        onChangeText={setNsec}
        secureTextEntry
      />
      
      <TextInput
        style={globalStyles.input}
        placeholder="Agent Name"
        value={name}
        onChangeText={setName}
        editable={!!nsec}
      />
      
      <TouchableOpacity 
        style={globalStyles.button}
        onPress={handleLogin}
      >
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}