import { StatusBar } from "expo-status-bar"
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { ThreeCanvas } from "@/engine/rendering/ThreeCanvas"
import { useGameEngine } from "@/engine/useGameEngine"

export default function GameScreen() {
  // Initialize the global engine instance via our stateful hook.
  const engine = useGameEngine();
  // Capture touch input handlers from ThreeCanvas.
  const [touchHandlers, setTouchHandlers] = useState({});

  console.log("Engine:", engine);

  return (
    <View style={styles.container}>
      {engine && (
        <ThreeCanvas
          style={styles.canvas}
          engine={engine}
          onTouchHandlers={setTouchHandlers}
        />
      )}
      {/* This overlay captures touch events and passes them to the PanResponder */}
      <View style={styles.touchOverlay} {...touchHandlers} />
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
  touchOverlay: {
    ...StyleSheet.absoluteFillObject, // covers the entire container
    backgroundColor: "transparent",
  },
});
