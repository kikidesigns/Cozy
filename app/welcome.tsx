import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../constants/styles';
import { Colors } from '../constants/Colors';

// Use our cozy color palette for agent colors
const AGENT_COLORS = [
  Colors.orangeBrown,
  Colors.skyBlue,
  Colors.sageGreen,
  Colors.warmBeige,
  Colors.darkOrangeBrown,
  Colors.lightBeige,
];

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
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[globalStyles.container, styles.container]}>
        <Text style={[globalStyles.title, styles.title]}>Welcome to Cozy</Text>
        
        {/* Agent Emoji Placeholder */}
        <View style={[styles.agentEmoji, { backgroundColor: selectedColor }]}>
          <Text style={styles.emojiText}>🤖</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Enter npub"
            placeholderTextColor={Colors.softGray}
            value={npub}
            onChangeText={setNpub}
          />
          
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Enter nsec"
            placeholderTextColor={Colors.softGray}
            value={nsec}
            onChangeText={setNsec}
            secureTextEntry
          />
          
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Agent Name"
            placeholderTextColor={Colors.softGray}
            value={name}
            onChangeText={setName}
            editable={!!nsec}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.colorContainer}>
          <Text style={styles.colorTitle}>Choose Agent Color</Text>
          <View style={styles.colorOptions}>
            {AGENT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOptionWrapper,
                  selectedColor === color && styles.selectedWrapper,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <View
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[globalStyles.button, styles.button, styles.resetButton]}
            onPress={() => {
              setNpub('');
              setNsec('');
              setName('');
              setSelectedColor(AGENT_COLORS[0]);
            }}
          >
            <Text style={[globalStyles.buttonText, styles.resetButtonText]}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, styles.button, styles.loginButton]}
            onPress={handleLogin}
          >
            <Text style={globalStyles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    color: Colors.darkOrangeBrown,
    textAlign: 'center',
    marginBottom: 30,
  },
  agentEmoji: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emojiText: {
    fontSize: 50,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.white,
    marginBottom: 15,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  colorTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOptionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    margin: 8,
    padding: 4,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedWrapper: {
    backgroundColor: Colors.orangeBrown,
    transform: [{ scale: 1.1 }],
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resetButton: {
    backgroundColor: Colors.white,
  },
  resetButtonText: {
    color: Colors.text,
  },
  loginButton: {
    backgroundColor: Colors.primary,
  },
});