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
    console.log("onContextCreate: GL context created");
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // Create a Three.js scene with a sky-blue background.
    const scene = new Scene();
    scene.background = new Color(0x87ceeb);
    console.log("Scene created");

    // Set up a perspective camera.
    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);
    console.log("Camera created at:", camera.position);

    // Use our RendererSystem from the engine.
    const rendererSystem = new RendererSystem(gl, scene, camera);
    engine.registerSystem(rendererSystem);
    console.log("RendererSystem registered");

    // Add static scene elements.
    const ground = new Ground();
    scene.add(ground);
    console.log("Ground added");

    const buildings = new BuildingsAndSidewalks();
    scene.add(buildings);
    console.log("Buildings added");

    const environment = new Environment();
    environment.setScene(scene);
    scene.add(environment);
    console.log("Environment set");

    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    console.log("Ambient light added");

    const lighting = new Lighting();
    scene.add(lighting);
    console.log("Directional lighting added");

    // Create the AgentPawn.
    const pawn = new AgentPawn();
    pawn.position.set(-6, 1, 0);
    pawn.moveTo(pawn.position.clone());
    scene.add(pawn);
    console.log("AgentPawn added");

    // Create a game controller to update the camera relative to the pawn.
    const gameController = new GameController(camera, pawn);
    engine.registerSystem({
      update: (delta: number) => gameController.update(delta),
    });
    console.log("GameController registered");

    // Set up touch input handling.
    const touchInput = new TouchInputSystem(gameController);
    if (onTouchHandlers) {
      onTouchHandlers(touchInput.panResponder.panHandlers);
    }
    console.log("TouchInputSystem registered");

    // --- NEW: Load a local GLTF/GLB model ("ruby") and add multiple copies ---
    const assetManager = new AssetManager();
    try {
      console.log("Loading ruby model...");
      const gltf = await assetManager.loadModel(
        require("../../assets/models/ruby-v1.glb")
      );
      console.log("Ruby model loaded successfully.");

      const rubyCount = 50; // More rubies
      const groundRadius = 30; // Larger spread radius
      const heightVariation = 1; // Add some height variation

      // Add ambient light to see the model better
      const ambientLight = new AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      for (let i = 0; i < rubyCount; i++) {
        // Deep-clone the loaded model scene.
        const rubyClone = gltf.scene.clone(true);
        // Scale up the model to make it more visible
        const scale = 1 + Math.random(); // Random scale between 1 and 2
        rubyClone.scale.set(scale, scale, scale);

        // Position with more variation
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * groundRadius; // Minimum 5 units from center
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = 1 + Math.random() * heightVariation; // Random height between 1 and 2
        rubyClone.position.set(x, y, z);

        // Random rotation on all axes for more variety
        rubyClone.rotation.x = Math.random() * Math.PI * 0.2 - 0.1; // Slight tilt
        rubyClone.rotation.y = Math.random() * Math.PI * 2; // Full rotation
        rubyClone.rotation.z = Math.random() * Math.PI * 0.2 - 0.1; // Slight tilt

        scene.add(rubyClone);
        console.log(
          `Ruby ${i + 1} added at position (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(
            2
          )}), scale: ${scale.toFixed(2)}`
        );
      }
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
