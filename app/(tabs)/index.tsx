import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';
import { ThreeCanvas } from '../../components/3d/ThreeCanvas';
import { Environment } from '../../components/3d/Environment';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileEmoji}>👤</Text>
            </View>
            <View style={styles.healthBar}>
              <View style={styles.healthFill} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.walletContainer}>
            <Text style={styles.walletBalance}>₿ 0.0001</Text>
          </View>
        </View>

        {/* 3D Scene */}
        <View style={styles.sceneContainer}>
          <ThreeCanvas
            style={styles.canvas}
            onContextCreate={(gl, scene) => {
              const environment = new Environment();
              environment.setScene(scene);
              scene.add(environment);
            }}
          />
        </View>

        {/* Chat Interface */}
        <View style={styles.chatContainer}>
          <View style={styles.chatHistory}>
            {/* Chat messages would go here */}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Chat with your agent..."
              placeholderTextColor={Colors.softGray}
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  container: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
    zIndex: 1,
  },
  profileButton: {
    alignItems: 'center',
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileEmoji: {
    fontSize: 30,
  },
  healthBar: {
    width: 50,
    height: 6,
    backgroundColor: Colors.softGray,
    borderRadius: 3,
    marginTop: 5,
    overflow: 'hidden',
  },
  healthFill: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.sageGreen,
    borderRadius: 3,
  },
  walletContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sceneContainer: {
    flex: 1,
    backgroundColor: Colors.skyBlue,
  },
  canvas: {
    flex: 1,
  },
  chatContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  chatHistory: {
    padding: 15,
    maxHeight: 200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.softGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.lightBeige,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});