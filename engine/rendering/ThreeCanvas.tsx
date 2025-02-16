import { GLView } from "expo-gl"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { AmbientLight, Color, PerspectiveCamera, Scene } from "three"
import { AssetManager } from "../assets/AssetManager" // Updated asset manager
import { AgentPawn } from "../entities/AgentPawn"
import { BuildingsAndSidewalks } from "../entities/BuildingsAndSidewalks"
import { Environment } from "../entities/Environment"
import { GameController } from "../entities/GameController"
import { Ground } from "../entities/Ground"
import { Lighting } from "../entities/Lighting"
import { TouchInputSystem } from "../input/TouchInputSystem"
import { RendererSystem } from "./RendererSystem"

interface ThreeCanvasProps {
  style?: any;
  engine: any;
  onTouchHandlers?: (handlers: any) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  style,
  engine,
  onTouchHandlers,
}) => {
  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // Create a Three.js scene with a sky-blue background.
    const scene = new Scene();
    scene.background = new Color(0x87ceeb);

    // Set up a perspective camera.
    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    // Use our RendererSystem from the engine.
    const rendererSystem = new RendererSystem(gl, scene, camera);
    engine.registerSystem(rendererSystem);

    // Add static scene elements.
    const ground = new Ground();
    scene.add(ground);

    const buildings = new BuildingsAndSidewalks();
    scene.add(buildings);

    const environment = new Environment();
    environment.setScene(scene);
    scene.add(environment);

    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const lighting = new Lighting();
    scene.add(lighting);

    // Create the AgentPawn.
    const pawn = new AgentPawn();
    pawn.position.set(-6, 1, 0);
    pawn.moveTo(pawn.position.clone());
    scene.add(pawn);

    // Create a game controller to update the camera relative to the pawn.
    const gameController = new GameController(camera, pawn);
    engine.registerSystem({
      update: (delta: number) => gameController.update(delta),
    });

    // Set up touch input handling.
    const touchInput = new TouchInputSystem(gameController);
    if (onTouchHandlers) {
      onTouchHandlers(touchInput.panResponder.panHandlers);
    }

    // --- NEW: Load a local GLTF/GLB model ---
    const assetManager = new AssetManager();
    try {
      // Replace the require path with your actual GLB/GLTF file location.
      const gltf = await assetManager.loadModel(require("../../assets/models/ruby.gltf"));
      // Optionally adjust the model’s transform.
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.scale.set(1, 1, 1);
      scene.add(gltf.scene);
    } catch (error) {
      console.error("Error loading GLTF model:", error);
    }
    // --- END NEW ---

  }, [engine, onTouchHandlers]);

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
