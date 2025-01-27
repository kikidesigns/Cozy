import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const onContextCreate = async (gl) => {
    // Create a WebGLRenderer without a DOM element
    const renderer = new THREE.WebGLRenderer({
      gl,
      antialias: true,
      alpha: true,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );

    // Set size
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Animation function
    const render = () => {
      requestAnimationFrame(render);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  };

  return (
    <ThemedView style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});