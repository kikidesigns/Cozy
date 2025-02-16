import { GLView } from "expo-gl"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { AmbientLight, Color, PerspectiveCamera, Scene, Vector3 } from "three"
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
    camera.position.set(0, 15, 30);  // Moved back and up for a better view
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

    // const buildings = new BuildingsAndSidewalks();
    // scene.add(buildings);
    // console.log("Buildings added");

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

    // --- NEW: Load and scatter ruby and tower models ---
    const assetManager = new AssetManager();
    try {
      // Load ruby model
      // console.log("Loading ruby model...");
      // const rubyGltf = await assetManager.loadModel(
      //   require("../../assets/models/ruby-v1.glb")
      // );
      // console.log("Ruby model loaded successfully.");

      // Load tower model
      console.log("Loading tower model...");
      const towerGltf = await assetManager.loadModel(
        require("../../assets/models/tower.glb")
      );
      console.log("Tower model loaded successfully.");

      // Add ambient light to see the models better
      const ambientLight = new AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      // Place towers
      const towerCount = 1;
      // const towerRadius = 20; // Slightly smaller radius for towers

      for (let i = 0; i < towerCount; i++) {
        const towerClone = towerGltf.scene.clone(true);

        // Enable shadows for the tower and all its child meshes
        towerClone.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Ensure materials are set up for proper lighting
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        // Scale the tower to a fixed size
        const scale = 2;
        towerClone.scale.set(scale, scale, scale);

        // Position tower 5 units away from starting point (-6, 1, 0)
        // We'll place it at (-1, 0, 0) which is 5 units to the right of the starting point
        const x = -1; // 5 units right from -6
        const z = 0;  // Same Z as starting point
        const y = 0;  // Place directly on ground
        towerClone.position.set(x, y, z);

        // Make tower face the starting point
        // Calculate direction from tower to starting point
        const startPoint = new Vector3(-6, 0, 0);
        towerClone.lookAt(startPoint);
        // Rotate 180 degrees since we want the front to face the starting point
        towerClone.rotation.y += Math.PI;

        scene.add(towerClone);
        console.log(
          `Tower placed at position (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(
            2
          )}), scale: ${scale.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error("Error loading models:", error);
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
