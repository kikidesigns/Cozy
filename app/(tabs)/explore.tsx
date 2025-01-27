import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { ExpoWebGLRenderingContext } from 'expo-gl';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
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

    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create a cube with the tangerine orange color
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xFF8C00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

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
      <ThemedText style={[styles.title, { color: Colors[colorScheme ?? 'light'].tint }]}>
        Explore
      </ThemedText>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  glView: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
});