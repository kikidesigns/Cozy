import { router } from "expo-router"
import React, { useCallback, useRef, useState } from "react"
import {
  Dimensions, Keyboard, KeyboardAvoidingView, PanResponder, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as THREE from "three"
import { Ionicons } from "@expo/vector-icons"
import { AgentPawn } from "../components/3d/AgentPawn"
import { BuildingsAndSidewalks } from "../components/3d/BuildingsAndSidewalks"
import { Environment } from "../components/3d/Environment"
import { GameController } from "../components/3d/GameController"
import { Lighting } from "../components/3d/Lighting"
import { ThreeCanvas } from "../components/3d/ThreeCanvas"
import { Colors } from "../constants/Colors"
import { useNostrAuth } from "../hooks/useNostrAuth"
import styles from "./HomeScreenStyles"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { keys } = useNostrAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isAgent: true },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Hold references to the pawn and game controller.
  const pawnRef = useRef<AgentPawn>();
  const gameControllerRef = useRef<GameController>();

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), text: message.trim(), isAgent: false },
      ]);
      setMessage('');
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
    const environment = new Environment();
    scene.add(environment);
    environment.setScene(scene);

    const buildings = new BuildingsAndSidewalks();
    scene.add(buildings);

    const lighting = new Lighting();
    scene.add(lighting);

    // Create and add the pawn.
    const pawn = new AgentPawn();
    pawn.position.set(0, 0, 0);
    scene.add(pawn);
    pawnRef.current = pawn;
  };

  // Once the camera is ready, create a GameController to update it relative to the pawn.
  const handleCameraReady = (camera: PerspectiveCamera) => {
    if (pawnRef.current) {
      const gameController = new GameController(camera, pawnRef.current);
      if (pawnRef.current.parent) {
        pawnRef.current.parent.add(gameController);
      }
      gameControllerRef.current = gameController;
    }
  };

  // Create a PanResponder to capture touch events.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        // If the touch is a tap (not a drag), command the pawn to move.
        if (
          Math.abs(gestureState.dx) < 5 &&
          Math.abs(gestureState.dy) < 5 &&
          gameControllerRef.current
        ) {
          const { locationX, locationY } = evt.nativeEvent;
          const { width, height } = Dimensions.get('window');
          // Convert screen coordinates to normalized device coordinates.
          const ndcX = (locationX / width) * 2 - 1;
          const ndcY = -(locationY / height) * 2 + 1;
          const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
          vector.unproject(gameControllerRef.current.camera);
          const dir = vector
            .sub(gameControllerRef.current.camera.position)
            .normalize();
          const distance = -gameControllerRef.current.camera.position.y / dir.y;
          const target = gameControllerRef.current.camera.position
            .clone()
            .add(dir.multiplyScalar(distance));
          gameControllerRef.current.movePawnTo(target);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // Horizontal dragging rotates the camera.
        if (gameControllerRef.current) {
          const deltaAngle = -gestureState.dx * 0.005;
          gameControllerRef.current.rotateCamera(deltaAngle);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <ThreeCanvas
          style={styles.canvas}
          onContextCreate={handleContextCreate}
          onCameraReady={handleCameraReady}
        />
        {/* Transparent overlay to capture touch events */}
        <View style={styles.touchOverlay} {...panResponder.panHandlers} />
      </View>

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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.spacer} />

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
                    msg.isAgent
                      ? styles.agentMessageText
                      : styles.userMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View
            style={[
              styles.inputContainer,
              { paddingBottom: Math.max(insets.bottom, 10) },
            ]}
          >
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
                !message.trim() && styles.sendButtonDisabled,
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
