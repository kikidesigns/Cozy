import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../constants/styles';

const AGENT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];

export default function WelcomeScreen() {
  const [npub, setNpub] = useState('');
  const [nsec, setNsec] = useState('');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AGENT_COLORS[0]);

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.replace('/home');
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to Cozy</Text>
      
      {/* Agent Emoji Placeholder */}
      <View style={[styles.agentEmoji, { backgroundColor: selectedColor }]}>
        <Text style={styles.emojiText}>🤖</Text>
      </View>

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

      {/* Color Selection */}
      <View style={styles.colorContainer}>
        {AGENT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[globalStyles.button, styles.button]}
          onPress={() => {
            setNpub('');
            setNsec('');
            setName('');
            setSelectedColor(AGENT_COLORS[0]);
          }}
        >
          <Text style={globalStyles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[globalStyles.button, styles.button]}
          onPress={handleLogin}
        >
          <Text style={globalStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  agentEmoji: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  emojiText: {
    fontSize: 40,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
});