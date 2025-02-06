import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { globalStyles } from '@/constants/styles';
import { welcomeStyles as styles } from './styles';
import { Colors } from '@/constants/Colors';

// Use our cozy color palette for agent colors
export const AGENT_COLORS = [
  Colors.orangeBrown,
  Colors.skyBlue,
  Colors.sageGreen,
  Colors.darkOrangeBrown,
  Colors.warmBeige,
  Colors.lightBeige,
];

interface LoginScreenProps {
  nsec: string;
  name: string;
  selectedColor: string;
  isLoading: boolean;
  onNsecChange: (text: string) => void;
  onNameChange: (text: string) => void;
  onColorSelect: (color: string) => void;
  onLogin: () => void;
  onCreateAccount: () => void;
}

export function LoginScreen({
  nsec,
  name,
  selectedColor,
  isLoading,
  onNsecChange,
  onNameChange,
  onColorSelect,
  onLogin,
  onCreateAccount,
}: LoginScreenProps) {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <Text style={[globalStyles.title, styles.title]}>Welcome to Cozy</Text>
      
      {/* Agent Emoji Placeholder */}
      <View style={[styles.agentEmoji, { backgroundColor: selectedColor }]}>
        <Text style={styles.emojiText}>🤖</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Enter nsec (or create new account)"
          placeholderTextColor={Colors.softGray}
          value={nsec}
          onChangeText={onNsecChange}
          secureTextEntry
        />
        
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Agent Name (optional)"
          placeholderTextColor={Colors.softGray}
          value={name}
          onChangeText={onNameChange}
        />
      </View>

      {/* Color Selection */}
      <View style={styles.colorContainer}>
        <Text style={styles.colorTitle}>Choose Agent Color (optional)</Text>
        <View style={styles.colorOptions}>
          {AGENT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOptionWrapper,
                selectedColor === color && styles.selectedWrapper,
              ]}
              onPress={() => onColorSelect(color)}
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
          style={[globalStyles.button, styles.button, styles.createButton]}
          onPress={onCreateAccount}
          disabled={isLoading}
        >
          <Text style={[globalStyles.buttonText, styles.createButtonText]}>
            Create New Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            globalStyles.button, 
            styles.button, 
            styles.loginButton,
            isLoading && styles.disabledButton
          ]}
          onPress={onLogin}
          disabled={isLoading || !nsec.trim()}
        >
          <Text style={[globalStyles.buttonText, styles.loginButtonText]}>
            {isLoading ? 'Loading...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}