import { router } from 'expo-router';
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThreeCanvas } from '../components/3d/ThreeCanvas';
import { AgentPawn } from '../components/3d/AgentPawn';
import { Environment } from '../components/3d/Environment';
import { Lighting } from '../components/3d/Lighting';
import { Scene } from 'three';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isAgent: true },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), text: message.trim(), isAgent: false },
      ]);
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const handleLogout = () => {
    router.replace('/welcome');
  };

  const handleContextCreate = (gl: WebGLRenderingContext, scene: Scene) => {
    const environment = new Environment();
    scene.add(environment);

    const lighting = new Lighting();
    scene.add(lighting);

    const pawn = new AgentPawn();
    pawn.position.y = 1;
    scene.add(pawn);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* 3D Canvas */}
          <View style={styles.canvasContainer}>
            <ThreeCanvas
              style={styles.canvas}
              onContextCreate={handleContextCreate}
            />
          </View>

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
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageScroll}
              contentContainerStyle={styles.messageScrollContent}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.message,
                    msg.isAgent ? styles.agentMessage : styles.userMessage,
                  ]}
                >
                  <Text 
                    style={[
                      styles.messageText,
                      msg.isAgent ? styles.agentMessageText : styles.userMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor={Colors.softGray}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
              enablesReturnKeyAutomatically
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={message.trim() ? Colors.white : Colors.softGray} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue,
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 0,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
    backgroundColor: `${Colors.warmBeige}CC`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softGray,
    zIndex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 20,
  },
  healthBar: {
    width: 100,
    height: 10,
    backgroundColor: Colors.softGray,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  healthFill: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.sageGreen,
    borderRadius: 5,
  },
  journalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  journalButtonText: {
    fontSize: 20,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletButton: {
    backgroundColor: Colors.orangeBrown,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  walletText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  logoutText: {
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 5,
    zIndex: 1,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  agentMessage: {
    backgroundColor: `${Colors.warmBeige}F2`,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.softGray,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: `${Colors.orangeBrown}F2`,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  agentMessageText: {
    color: Colors.darkOrangeBrown,
  },
  userMessageText: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: `${Colors.warmBeige}F2`,
    borderTopWidth: 1,
    borderTopColor: Colors.softGray,
    zIndex: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    color: Colors.darkOrangeBrown,
    borderWidth: 1,
    borderColor: Colors.softGray,
    fontSize: 16,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.softGray,
    borderColor: Colors.softGray,
  },
});