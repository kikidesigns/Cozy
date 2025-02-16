// engine/rendering/ThreeCanvas.tsx
import { GLView } from "expo-gl"
import { Renderer } from "expo-three"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { Color, PerspectiveCamera, Scene } from "three"
import { GameEngine } from "../core/GameEngine"
import { AgentPawn } from "../entities/AgentPawn"
import { BuildingsAndSidewalks } from "../entities/BuildingsAndSidewalks"
import { Environment } from "../entities/Environment"
import { GameController } from "../entities/GameController"
import { Ground } from "../entities/Ground"
import { Lighting } from "../entities/Lighting"
import { TouchInputSystem } from "../input/TouchInputSystem"

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
  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // Create a scene with a sky-blue background.
    const scene = new Scene();
    scene.background = new Color(0x87ceeb);

    // Set up a perspective camera.
    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    // Create the renderer.
    const renderer = new Renderer({ gl, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x87ceeb, 1);

    // Register the renderer system.
    const rendererSystem = {
      update: (delta: number) => {
        renderer.render(scene, camera);
        if ((gl as any).endFrameEXP) {
          (gl as any).endFrameEXP();
        }
      },
    };
    engine.registerSystem(rendererSystem);

    // Add the ground.
    const ground = new Ground();
    scene.add(ground);

    // Add buildings.
    const buildings = new BuildingsAndSidewalks();
    scene.add(buildings);

    // Add environment (sets fog and background).
    const environment = new Environment();
    environment.setScene(scene);
    scene.add(environment);

    // Add lighting.
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const lighting = new Lighting();
    scene.add(lighting);

    // Create the AgentPawn.
    const pawn = new AgentPawn();
    // Spawn the pawn on grass next to the center building (e.g., x = -6)
    pawn.position.set(-6, 1, 0);
    // **Update the pawn's target to its current position**
    pawn.moveTo(pawn.position.clone());
    scene.add(pawn);

    // Create a game controller to update the camera relative to the pawn.
    const gameController = new GameController(camera, pawn);
    engine.registerSystem({
      update: (delta: number) => gameController.update(delta),
    });

    // Instantiate the TouchInputSystem for camera control.
    const touchInput = new TouchInputSystem(gameController);
    if (onTouchHandlers) {
      onTouchHandlers(touchInput.panResponder.panHandlers);
    }
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
