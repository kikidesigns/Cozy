import { GLView } from "expo-gl"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { GameEngine } from "@/engine/core/GameEngine"
import { AgentPawn } from "@/engine/entities/AgentPawn"
import { BuildingsAndSidewalks } from "@/engine/entities/BuildingsAndSidewalks"
import { Environment } from "@/engine/entities/Environment"
import { GameController } from "@/engine/entities/GameController"
import { Lighting } from "@/engine/entities/Lighting"
import { TouchInputSystem } from "@/engine/input/TouchInputSystem"
import { RendererSystem } from "@/engine/rendering/RendererSystem"
import { SceneManager } from "@/engine/rendering/SceneManager"

interface ThreeCanvasProps {
  style?: any;
  onEngineReady?: (engine: GameEngine, touchPanHandlers: any) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ style, onEngineReady }) => {
  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // Create our scene and camera.
    const sceneManager = new SceneManager(width, height);
    // Create the renderer system.
    const rendererSystem = new RendererSystem(gl, sceneManager.scene, sceneManager.camera);
    // Initialize our game engine.
    const engine = new GameEngine();
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

    // Create the agent pawn.
    const agentPawn = new AgentPawn();
    agentPawn.position.set(0, 0, 0);
    sceneManager.scene.add(agentPawn);

    // Create game controller to sync camera & pawn.
    const gameController = new GameController(sceneManager.camera, agentPawn);
    // Register game controller as a system (using duck typing)
    engine.registerSystem({
      update: (delta: number) => gameController.update(delta),
    });

    // Set up touch input.
    const touchInput = new TouchInputSystem(gameController);

    // Start the engine.
    engine.start();

    // Inform parent of our engine and touch handlers.
    onEngineReady && onEngineReady(engine, touchInput.panResponder.panHandlers);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
  },
});
