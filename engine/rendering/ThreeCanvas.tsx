// engine/rendering/ThreeCanvas.tsx
import { GLView } from "expo-gl"
import { Renderer } from "expo-three"
import React, { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import {
  BoxGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene
} from "three"

interface ThreeCanvasProps {
  style?: any;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ style }) => {
  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    // Create a basic Three.js scene
    const scene = new Scene();
    scene.background = new Color(0x87ceeb); // sky blue

    // Set up a perspective camera
    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create a red cube using MeshBasicMaterial (unlit)
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    // Create the renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    // Clear with sky blue so the scene background shows
    renderer.setClearColor(0x87ceeb, 1);

    // Minimal render loop
    const render = () => {
      requestAnimationFrame(render);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      if (gl.endFrameEXP) gl.endFrameEXP();
    };
    render();
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
  },
  glView: {
    flex: 1,
  },
});
