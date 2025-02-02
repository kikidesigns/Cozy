import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { Scene, PerspectiveCamera, Euler } from 'three';

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext, scene: Scene) => void;
  style?: any;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  originalCameraRotation: Euler;
}

// Animation configuration
const DRAG_SENSITIVITY = 0.005;
const RETURN_ANIMATION_DURATION = 1000; // ms
const MAX_ROTATION_X = Math.PI / 4; // 45 degrees
const MAX_ROTATION_Y = Math.PI / 3; // 60 degrees

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onContextCreate, style }) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();
  const animationFrameRef = useRef<number>();
  const returnAnimationStartTime = useRef<number>();

  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    originalCameraRotation: new Euler()
  });

  const onGLContextCreate = async (gl: WebGLRenderingContext) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setClearColor(0x000000, 1);
    
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
    camera.position.z = 7; // Moved back for better view
    camera.position.y = 3; // Higher position
    camera.lookAt(0, 1, 0); // Look at pawn height
    cameraRef.current = camera;

    // Store original camera rotation
    dragStateRef.current.originalCameraRotation.copy(camera.rotation);

    // Call custom context creation handler
    onContextCreate?.(gl, sceneRef.current);

    // Add touch/mouse event listeners to GLView
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.addEventListener('mousedown', onDragStart);
    canvas.addEventListener('mousemove', onDragMove);
    canvas.addEventListener('mouseup', onDragEnd);
    canvas.addEventListener('mouseleave', onDragEnd);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onDragEnd);
    canvas.addEventListener('touchcancel', onDragEnd);

    // Start render loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Handle return animation if active
      if (!dragStateRef.current.isDragging && returnAnimationStartTime.current && cameraRef.current) {
        const elapsed = Date.now() - returnAnimationStartTime.current;
        const progress = Math.min(elapsed / RETURN_ANIMATION_DURATION, 1);
        
        if (progress < 1) {
          // Smooth easing function
          const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
          const t = easeOutCubic(progress);
          
          // Interpolate camera rotation back to original
          cameraRef.current.rotation.x = lerp(
            dragStateRef.current.currentX,
            dragStateRef.current.originalCameraRotation.x,
            t
          );
          cameraRef.current.rotation.y = lerp(
            dragStateRef.current.currentY,
            dragStateRef.current.originalCameraRotation.y,
            t
          );
        } else {
          // Animation complete
          returnAnimationStartTime.current = undefined;
          cameraRef.current.rotation.copy(dragStateRef.current.originalCameraRotation);
        }
      }

      renderer.render(sceneRef.current, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
  };

  const onDragStart = (event: MouseEvent) => {
    event.preventDefault();
    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    returnAnimationStartTime.current = undefined;
  };

  const onTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = touch.clientX;
    dragStateRef.current.startY = touch.clientY;
    returnAnimationStartTime.current = undefined;
  };

  const onDragMove = (event: MouseEvent) => {
    if (!dragStateRef.current.isDragging || !cameraRef.current) return;
    event.preventDefault();
    
    const deltaX = (event.clientX - dragStateRef.current.startX) * DRAG_SENSITIVITY;
    const deltaY = (event.clientY - dragStateRef.current.startY) * DRAG_SENSITIVITY;
    
    updateCameraRotation(deltaX, deltaY);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!dragStateRef.current.isDragging || !cameraRef.current) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = (touch.clientX - dragStateRef.current.startX) * DRAG_SENSITIVITY;
    const deltaY = (touch.clientY - dragStateRef.current.startY) * DRAG_SENSITIVITY;
    
    updateCameraRotation(deltaX, deltaY);
  };

  const updateCameraRotation = (deltaX: number, deltaY: number) => {
    if (!cameraRef.current) return;

    // Calculate new rotation values with limits
    const newRotationX = Math.max(
      -MAX_ROTATION_X,
      Math.min(MAX_ROTATION_X, dragStateRef.current.originalCameraRotation.x - deltaY)
    );
    const newRotationY = Math.max(
      -MAX_ROTATION_Y,
      Math.min(MAX_ROTATION_Y, dragStateRef.current.originalCameraRotation.y - deltaX)
    );

    // Apply new rotation
    cameraRef.current.rotation.x = newRotationX;
    cameraRef.current.rotation.y = newRotationY;

    // Store current rotation for animation
    dragStateRef.current.currentX = newRotationX;
    dragStateRef.current.currentY = newRotationY;
  };

  const onDragEnd = () => {
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    returnAnimationStartTime.current = Date.now();
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Remove event listeners if canvas exists
      const canvas = rendererRef.current?.getContext()?.canvas as HTMLCanvasElement;
      if (canvas) {
        canvas.removeEventListener('mousedown', onDragStart);
        canvas.removeEventListener('mousemove', onDragMove);
        canvas.removeEventListener('mouseup', onDragEnd);
        canvas.removeEventListener('mouseleave', onDragEnd);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onDragEnd);
        canvas.removeEventListener('touchcancel', onDragEnd);
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
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});