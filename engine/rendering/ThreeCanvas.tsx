// engine/rendering/ThreeCanvas.tsx
import { GLView } from "expo-gl"
import { Renderer } from "expo-three"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import {
  AmbientLight, BoxGeometry, Color, Mesh, MeshBasicMaterial,
  PerspectiveCamera, Scene
} from "three"
import { AgentPawn } from "../entities/AgentPawn"
import { Ground } from "../entities/Ground"

interface ThreeCanvasProps {
  style?: any;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ style }) => {
  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // Create a Three.js scene with a sky-blue background.
    const scene = new Scene();
    scene.background = new Color(0x87ceeb);

    // Set up a perspective camera.
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    // Create the renderer.
    const renderer = new Renderer({ gl, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x87ceeb, 1);

    // Add the ground.
    const ground = new Ground();
    scene.add(ground);

    // Add a red test cube.
    const testCube = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial({ color: 0xff0000 })
    );
    testCube.position.set(-3, 2, 0);
    scene.add(testCube);

    // Add an ambient light so that MeshStandardMaterial objects are lit.
    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Add the AgentPawn (green cube).
    const pawn = new AgentPawn();
    pawn.position.set(0, 1, 0);
    scene.add(pawn);

    // Minimal render loop.
    const renderLoop = () => {
      requestAnimationFrame(renderLoop);
      testCube.rotation.x += 0.01;
      testCube.rotation.y += 0.01;
      renderer.render(scene, camera);
      if (gl.endFrameEXP) gl.endFrameEXP();
    };
    renderLoop();
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  glView: { flex: 1 },
});
