// engine/rendering/ThreeCanvas.tsx
import { GLView } from "expo-gl"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { AmbientLight, Color, PerspectiveCamera, Scene, Vector3 } from "three"
import { getProfile } from "../../utils/auth" // Used to update the player’s balance
import { AssetManager } from "../assets/AssetManager"
import { AgentPawn } from "../entities/AgentPawn"
import { BuildingsAndSidewalks } from "../entities/BuildingsAndSidewalks"
import { Environment } from "../entities/Environment"
import { GameController } from "../entities/GameController"
import { Ground } from "../entities/Ground"
import { Lighting } from "../entities/Lighting"
import { NpcAgent } from "../entities/NpcAgent" // NEW: NPC agent
import { TouchInputSystem } from "../input/TouchInputSystem"
import { RendererSystem } from "./RendererSystem"

export const ThreeCanvas: React.FC<{
  style?: any;
  engine: any;
  onTouchHandlers?: (handlers: any) => void;
}> = ({ style, engine, onTouchHandlers }) => {
  const onContextCreate = useCallback(
    async (gl: WebGLRenderingContext) => {
      console.log("onContextCreate: GL context created");
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      // Create a Three.js scene.
      const scene = new Scene();
      scene.background = new Color(0x87ceeb);
      console.log("Scene created");

      // Set up a perspective camera.
      const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.set(0, 15, 30);
      camera.lookAt(0, 0, 0);
      console.log("Camera created at:", camera.position);

      // Set up the renderer.
      const rendererSystem = new RendererSystem(gl, scene, camera);
      engine.registerSystem(rendererSystem);
      console.log("RendererSystem registered");

      // Add static scene elements.
      const ground = new Ground();
      scene.add(ground);
      console.log("Ground added");

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

      // Create the player pawn.
      const pawn = new AgentPawn();
      pawn.position.set(-6, 1, 0);
      pawn.moveTo(pawn.position.clone());
      scene.add(pawn);
      console.log("AgentPawn added");

      // Update the player pawn’s balance after fetching profile info.
      getProfile()
        .then((profile) => {
          pawn.updateBalance(profile.bitcoin_balance);
        })
        .catch((err) => console.error("Failed to fetch profile", err));

      // Create a game controller.
      const gameController = new GameController(camera, pawn);
      engine.registerSystem({
        update: (delta: number) => gameController.update(delta),
      });
      console.log("GameController registered");

      // Set up touch input handling.
      const touchInput = new TouchInputSystem(gameController, scene);
      if (onTouchHandlers) {
        onTouchHandlers(touchInput.panResponder.panHandlers);
      }
      console.log("TouchInputSystem registered");

      // --- Load and place the tower model ---
      const assetManager = new AssetManager();
      try {
        console.log("Loading tower model...");
        const towerGltf = await assetManager.loadModel(
          require("../../assets/models/tower.glb")
        );
        console.log("Tower model loaded successfully.");

        const towerClone = towerGltf.scene.clone(true);
        towerClone.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        const scale = 2;
        towerClone.scale.set(scale, scale, scale);
        const x = -18;
        const z = -13;
        const y = 0;
        towerClone.position.set(x, y, z);

        const startPoint = new Vector3(-2, 0, 12);
        towerClone.lookAt(startPoint);
        towerClone.rotation.y -= Math.PI * 0.8;
        scene.add(towerClone);
        console.log(
          `Tower placed at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}), scale: ${scale.toFixed(2)}`
        );
      } catch (error) {
        console.error("Error loading tower model:", error);
      }
      // --- END TOWER ---

      // --- Spawn 2 NPC agents in front of the tower ---
      // Create NPC agents with agent IDs, names, and initial balances.
      const npc1 = new NpcAgent("agent-1", "Agent 1", 100);
      const npc2 = new NpcAgent("agent-2", "Agent 2", 50);
      npc1.position.set(-17, 1, -10);
      npc2.position.set(-19, 1, -10);
      scene.add(npc1);
      scene.add(npc2);
      console.log("NPC agents added to the scene.");

      engine.registerSystem({
        update: (delta: number) => {
          npc1.update(delta);
          npc2.update(delta);
        },
      });
      console.log("NPC agents update system registered.");
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

export default ThreeCanvas;
