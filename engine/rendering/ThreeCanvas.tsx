// engine/rendering/ThreeCanvas.tsx
import { GLView } from "expo-gl"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { GameEngine } from "../core/GameEngine"
import { AgentPawn } from "../entities/AgentPawn"
import { BuildingsAndSidewalks } from "../entities/BuildingsAndSidewalks"
import { Environment } from "../entities/Environment"
import { GameController } from "../entities/GameController"
import { Lighting } from "../entities/Lighting"
import { TouchInputSystem } from "../input/TouchInputSystem"
import { RendererSystem } from "./RendererSystem"
import { SceneManager } from "./SceneManager"

interface ThreeCanvasProps {
  style?: any;
  engine: GameEngine;
  onTouchHandlers?: (handlers: any) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  style,
  engine,
  onTouchHandlers,
}) => {
  console.log('ThreeCanvas')
  const onContextCreate = useCallback(
    async (gl: WebGLRenderingContext) => {
      console.log('onContextCreate')
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      // Create our scene and camera.
      const sceneManager = new SceneManager(width, height);

      // Create the renderer system and register it.
      const rendererSystem = new RendererSystem(gl, sceneManager.scene, sceneManager.camera);
      engine.registerSystem(rendererSystem);

      // Set up environment.
      const environment = new Environment();
      environment.setScene(sceneManager.scene);
      sceneManager.scene.add(environment);

      // Add buildings and sidewalks.
      const buildings = new BuildingsAndSidewalks();
      sceneManager.scene.add(buildings);

      // Add lighting.
      const lighting = new Lighting();
      sceneManager.scene.add(lighting);

      // Create the agent pawn and place it at the center.
      const pawn = new AgentPawn();
      pawn.position.set(0, 0, 0);
      sceneManager.scene.add(pawn);

      // Create game controller to sync camera & pawn.
      const gameController = new GameController(sceneManager.camera, pawn);
      engine.registerSystem({
        update: (delta: number) => gameController.update(delta),
      });

      // Set up touch input.
      const touchInput = new TouchInputSystem(gameController);
      if (onTouchHandlers) {
        onTouchHandlers(touchInput.panResponder.panHandlers);
      }
    },
    [engine, onTouchHandlers]
  );

  return (
    <View style={[styles.container, style]}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  glView: {
    flex: 1,
  },
});
