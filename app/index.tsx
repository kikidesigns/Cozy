import { StatusBar } from "expo-status-bar"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useGameEngine } from "@/engine"
import { ThreeCanvas } from "../components/3d/ThreeCanvas"

export default function GameScreen() {
  // This hook starts the engine lifecycle (e.g. for shared systems, logging, etc.)
  // Even though ThreeCanvas creates its own engine instance,
  // this demonstrates how to integrate global engine functionality.
  const engineRef = useGameEngine();

  return (
    <View style={styles.container}>
      <ThreeCanvas style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback background color.
  },
  canvas: {
    flex: 1,
  },
});
