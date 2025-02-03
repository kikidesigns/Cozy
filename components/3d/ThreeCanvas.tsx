import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { Scene, PerspectiveCamera, Color } from 'three';
import { Colors } from '../../constants/Colors';

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext, scene: Scene) => void;
  style?: any;
}

interface ExpoGLContext extends WebGLRenderingContext {
  endFrameEXP?: () => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onContextCreate, style }) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();

  const onGLContextCreate = async (gl: ExpoGLContext) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setClearColor(0x000000, 0); // Set transparent background
    
    // Set size using gl.drawingBufferWidth/Height
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    renderer.setSize(width, height);

    rendererRef.current = renderer;

    // Initialize camera with better positioning
    const camera = new PerspectiveCamera(
      60, // FOV
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12); // Adjusted for better platform view
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Set scene background color
    const skyBlueColor = new Color(Colors.skyBlue);
    sceneRef.current.background = skyBlueColor;
    sceneRef.current.fog = null; // Remove fog initially

    // Call custom context creation handler
    onContextCreate?.(gl, sceneRef.current);

    // Start render loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(sceneRef.current, camera);
      gl.endFrameEXP?.();
    };
    render();
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView
        style={styles.glView}
        onContextCreate={onGLContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.skyBlue, // Fallback color
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});