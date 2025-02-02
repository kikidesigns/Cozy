import { useEffect, useRef } from 'react';
import { Scene } from 'three';
import { Renderer } from 'expo-three';

interface Use3DContextProps {
  onCleanup?: () => void;
}

export const use3DContext = ({ onCleanup }: Use3DContextProps = {}) => {
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<Renderer>();
  const frameIdRef = useRef<number>();

  useEffect(() => {
    return () => {
      // Cancel animation frame
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Custom cleanup
      onCleanup?.();
    };
  }, [onCleanup]);

  const initContext = (gl: WebGLRenderingContext) => {
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

    // Initialize scene
    const scene = new Scene();
    sceneRef.current = scene;

    return {
      renderer,
      scene,
      gl,
    };
  };

  return {
    initContext,
    sceneRef,
    rendererRef,
    frameIdRef,
  };
};