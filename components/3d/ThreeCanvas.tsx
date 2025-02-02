import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Scene, PerspectiveCamera } from 'three';

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext) => void;
  style?: any;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onContextCreate, style }) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();

  const onGLContextCreate = async (gl: WebGLRenderingContext) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    rendererRef.current = renderer;

    // Initialize camera
    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Call custom context creation handler
    onContextCreate?.(gl);

    // Start render loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(sceneRef.current, camera);
      gl.endFrameEXP();
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
    <View style={style}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onGLContextCreate}
      />
    </View>
  );
};