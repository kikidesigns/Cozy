import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { Scene, PerspectiveCamera } from 'three';

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext, scene: Scene) => void;
  style?: any;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onContextCreate, style }) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();

  const onGLContextCreate = async (gl: WebGLRenderingContext) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setClearColor(0x000000, 1);
    
    // Set size using gl.drawingBufferWidth/Height
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    renderer.setPixelRatio(width / height);
    renderer.domElement.width = width;
    renderer.domElement.height = height;

    rendererRef.current = renderer;

    // Initialize camera
    const camera = new PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Call custom context creation handler
    onContextCreate?.(gl, sceneRef.current);

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