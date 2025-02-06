import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../constants/styles';
import { Colors } from '../constants/Colors';
import { useNostrAuth } from '../hooks/useNostrAuth';
import * as Clipboard from 'expo-clipboard';

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
  const { login, createNewAccount, keys, error } = useNostrAuth();
  const [nsec, setNsec] = useState('');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AGENT_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
          // TODO: Implement profile update via Nostr event
          console.log('Profile update not implemented yet:', { name, color: selectedColor });
        }
        router.replace('/home');
      } else {
        Alert.alert('Error', 'Invalid nsec key');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      const result = await createNewAccount();
      if (result.success && result.mnemonic) {
        setMnemonic(result.mnemonic);
      } else {
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMnemonic = async () => {
    if (mnemonic) {
      await Clipboard.setStringAsync(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmMnemonic = () => {
    if (name || selectedColor) {
      // TODO: Implement profile update via Nostr event
      console.log('Profile update not implemented yet:', { name, color: selectedColor });
    }
    router.replace('/home');
  };

  // If we have a mnemonic, show it for backup
  if (mnemonic) {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[globalStyles.container, styles.container]}>
          <Text style={[globalStyles.title, styles.title]}>Backup Your Account</Text>
          
          <View style={styles.mnemonicContainer}>
            <Text style={styles.mnemonicWarning}>
              Write down these 12 words in order and keep them safe. They are the only way to recover your account!
            </Text>
            <View style={styles.mnemonicWords}>
              {mnemonic.split(' ').map((word, index) => (
                <View key={index} style={styles.wordContainer}>
                  <Text style={styles.wordNumber}>{index + 1}.</Text>
                  <Text style={styles.word}>{word}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[globalStyles.button, styles.button, styles.copyButton]}
            onPress={handleCopyMnemonic}
          >
            <Text style={[globalStyles.buttonText, styles.copyButtonText]}>
              {copied ? 'Copied!' : 'Copy All Words'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, styles.button, styles.confirmButton]}
            onPress={handleConfirmMnemonic}
          >
            <Text style={[globalStyles.buttonText, styles.confirmButtonText]}>
              I've Written These Down
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
            placeholder="Enter nsec (or create new account)"
            placeholderTextColor={Colors.softGray}
            value={nsec}
            onChangeText={setNsec}
            secureTextEntry
          />
          
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Agent Name (optional)"
            placeholderTextColor={Colors.softGray}
            value={name}
            onChangeText={setName}
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
            style={[globalStyles.button, styles.button, styles.createButton]}
            onPress={handleCreateAccount}
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
            onPress={handleLogin}
            disabled={isLoading || !nsec.trim()}
          >
            <Text style={[globalStyles.buttonText, styles.loginButtonText]}>
              {isLoading ? 'Loading...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
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
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  button: {
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    backgroundColor: Colors.sageGreen,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.orangeBrown,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: Colors.skyBlue,
    marginBottom: 16,
  },
  copyButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.sageGreen,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: Colors.orangeBrown,
    marginTop: 16,
    textAlign: 'center',
  },
  mnemonicContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 20,
  },
  mnemonicWarning: {
    color: Colors.orangeBrown,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  mnemonicWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    width: '45%',
    paddingVertical: 4,
  },
  wordNumber: {
    color: Colors.softGray,
    width: 24,
    fontSize: 12,
  },
  word: {
    color: Colors.darkOrangeBrown,
    fontSize: 14,
    fontWeight: '500',
  },
});
