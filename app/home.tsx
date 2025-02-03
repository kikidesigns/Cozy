import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThreeCanvas } from '../components/3d/ThreeCanvas';
import { AgentPawn } from '../components/3d/AgentPawn';
import { Environment } from '../components/3d/Environment';
import { Lighting } from '../components/3d/Lighting';
import { Scene } from 'three';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isAgent: true },
  ]);
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), text: message, isAgent: false },
      ]);
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const handleLogout = () => {
    router.replace('/welcome');
  };

  const handleContextCreate = (gl: WebGLRenderingContext, scene: Scene) => {
    // Add environment (platform and sun)
    const environment = new Environment();
    scene.add(environment);

    // Add lighting
    const lighting = new Lighting();
    scene.add(lighting);

    // Add agent pawn
    const pawn = new AgentPawn();
    pawn.position.y = 1; // Lift pawn above platform
    scene.add(pawn);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
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
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)']}
            style={styles.fadeGradient}
            pointerEvents="none"
          />
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
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

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor={Colors.softGray}
              multiline
              blurOnSubmit={true}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue,
  },
  keyboardView: {
    flex: 1,
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
    backgroundColor: `${Colors.warmBeige}CC`, // CC = 80% opacity
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT / 3,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  fadeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 2,
  },
  chatScroll: {
    flex: 1,
    width: '100%',
  },
  chatScrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  agentMessage: {
    backgroundColor: `${Colors.warmBeige}F2`, // F2 = 95% opacity
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.softGray,
  },
  userMessage: {
    backgroundColor: `${Colors.orangeBrown}F2`, // F2 = 95% opacity
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
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
    backgroundColor: `${Colors.warmBeige}CC`, // CC = 80% opacity
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
    paddingVertical: 10,
    color: Colors.darkOrangeBrown,
    borderWidth: 1,
    borderColor: Colors.softGray,
    maxHeight: 100,
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
  sendButtonText: {
    fontSize: 20,
  },
});