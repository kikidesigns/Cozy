import { StatusBar } from "expo-status-bar"
// app/index.tsx
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { ThreeCanvas } from "@/engine/rendering/ThreeCanvas"
import ChatOverlay from "@/engine/ui/ChatOverlay"
import { useGameEngine } from "@/engine/useGameEngine"

export default function GameScreen() {
  const engine = useGameEngine();
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
      <View style={styles.touchOverlay} {...touchHandlers} />
      {/* ChatOverlay is rendered on top of the game view */}
      <ChatOverlay />
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
