import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../constants/styles';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isAgent: true },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), text: message, isAgent: false },
      ]);
      setMessage('');
    }
  };

  const handleLogout = () => {
    router.replace('/welcome');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View style={styles.healthBar}>
            <View style={styles.healthFill} />
          </View>
          <TouchableOpacity 
            style={styles.journalButton}
            onPress={() => router.push('/journal')}
          >
            <Text style={styles.journalButtonText}>📔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity 
            style={styles.walletButton}
            onPress={() => router.push('/wallet')}
          >
            <Text style={styles.walletText}>₿ 1,234</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {chatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.message,
              msg.isAgent ? styles.agentMessage : styles.userMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
    backgroundColor: '#2a2a2a',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  healthBar: {
    width: 100,
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    marginLeft: 10,
  },
  healthFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
  },
  journalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  journalButtonText: {
    fontSize: 20,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  walletText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  agentMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#4ECDC4',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2a2a2a',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
});