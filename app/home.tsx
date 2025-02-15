import { router } from "expo-router"
import React, { useCallback, useRef, useState } from "react"
import {
  Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Scene } from "three"
import { Ionicons } from "@expo/vector-icons"
import { BuildingsAndSidewalks } from "../components/3d/BuildingsAndSidewalks"
import { Environment } from "../components/3d/Environment"
import { Lighting } from "../components/3d/Lighting"
import { ThreeCanvas } from "../components/3d/ThreeCanvas"
import { Colors } from "../constants/Colors"
import { useNostrAuth } from "../hooks/useNostrAuth"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CHAT_HEIGHT = SCREEN_HEIGHT / 3;

export default function HomeScreen() {
  const { keys } = useNostrAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isAgent: true },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), text: message.trim(), isAgent: false },
      ]);
      setMessage('');
      // On web, keep focus after sending
      if (Platform.OS === 'web') {
        inputRef.current?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleLogout = () => {
    router.replace('/welcome');
  };

  const handleContextCreate = (gl: WebGLRenderingContext, scene: Scene) => {
    // Set up the sky & fog
    const environment = new Environment();
    scene.add(environment);
    environment.setScene(scene);

    // Add the circular grass area, buildings, and curved sidewalks
    const buildings = new BuildingsAndSidewalks();
    scene.add(buildings);

    // Add lighting (sun, ambient, etc.)
    const lighting = new Lighting();
    scene.add(lighting);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  const handleMainPress = () => {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Canvas with press handler */}
      <Pressable style={styles.canvasContainer} onPress={handleMainPress}>
        <ThreeCanvas
          style={styles.canvas}
          onContextCreate={handleContextCreate}
        />
      </Pressable>

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top || 50 }]}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
            {keys?.npub && (
              <View style={styles.npubBadge}>
                <Text style={styles.npubText} numberOfLines={1}>
                  {keys.npub.slice(0, 8)}...
                </Text>
              </View>
            )}
          </TouchableOpacity>
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

      {/* Spacer to push chat to bottom */}
      <View style={styles.spacer} />

      {/* Chat Container - Fixed to bottom third */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.chatWrapper}
      >
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

          {/* Input Area */}
          <View style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 10) }
          ]}>
            <TextInput
              ref={inputRef}
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
      </KeyboardAvoidingView>
    </View>
  );
}

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
  npubBadge: {
    position: 'absolute',
    bottom: -12,
    left: -4,
    right: -4,
    backgroundColor: Colors.darkOrangeBrown,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  npubText: {
    color: Colors.white,
    fontSize: 8,
    textAlign: 'center',
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
  spacer: {
    flex: 1,
  },
  chatWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_HEIGHT,
    zIndex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: `${Colors.warmBeige}F2`,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    backgroundColor: `${Colors.warmBeige}F2`,
    borderTopWidth: 1,
    borderTopColor: Colors.softGray,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    color: Colors.darkOrangeBrown,
    borderWidth: 1,
    borderColor: Colors.softGray,
    fontSize: 16,
    minHeight: 44,
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
  sendButtonDisabled: {
    backgroundColor: Colors.softGray,
    borderColor: Colors.softGray,
  },
});
