import { StatusBar } from "expo-status-bar"
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { ThreeCanvas } from "@/engine/rendering/ThreeCanvas"
import { useGameEngine } from "@/engine/useGameEngine"

export default function GameScreen() {
  // Initialize the global engine instance via our hook.
  const engineRef = useGameEngine();
  // Optionally, capture touch input handlers for overlay usage.
  const [touchHandlers, setTouchHandlers] = useState({});

  return (
    <View style={styles.container}>
      {engineRef.current && (
        <ThreeCanvas
          style={styles.canvas}
          engine={engineRef.current}
          onTouchHandlers={setTouchHandlers}
        />
      )}
      {/* Optionally overlay StatusBar */}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fallback background color.
  },
  canvas: {
    flex: 1,
  },
});
