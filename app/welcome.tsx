import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../constants/styles';
import { Colors } from '../constants/Colors';
import { useNostrAuth } from '../hooks/useNostrAuth';

// Use our cozy color palette for agent colors
const AGENT_COLORS = [
  Colors.orangeBrown,
  Colors.skyBlue,
  Colors.sageGreen,
  Colors.darkOrangeBrown,
  Colors.warmBeige,
  Colors.lightBeige,
];

export default function WelcomeScreen() {
  const { login, updateProfile } = useNostrAuth();
  const [nsec, setNsec] = useState('');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AGENT_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!nsec) {
      Alert.alert('Error', 'Please enter your nsec key');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(nsec);
      if (success) {
        if (name || selectedColor) {
          await updateProfile({
            name,
            color: selectedColor,
          });
        }
        router.replace('/home');
      } else {
        Alert.alert('Error', 'Invalid nsec key');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
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
              setNsec('');
              setName('');
              setSelectedColor(AGENT_COLORS[0]);
            }}
            disabled={isLoading}
          >
            <Text style={[globalStyles.buttonText, styles.resetButtonText]}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              globalStyles.button, 
              styles.button, 
              styles.loginButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={[globalStyles.buttonText, styles.loginButtonText]}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
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
    fontWeight: '600',
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
    borderWidth: 4,
    borderColor: Colors.white,
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
    borderWidth: 1,
    borderColor: Colors.softGray,
    color: Colors.darkOrangeBrown,
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
    fontWeight: '600',
    color: Colors.darkOrangeBrown,
    marginBottom: 10,
    textAlign: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  colorOptionWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    gap: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resetButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.softGray,
  },
  resetButtonText: {
    color: Colors.darkOrangeBrown,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.orangeBrown,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});