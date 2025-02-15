import { GLView } from "expo-gl"
import { Renderer, THREE } from "expo-three"
import React, { useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import { Color, FogExp2, PerspectiveCamera, Scene } from "three"
import { Colors } from "../../constants/Colors"
import { GameController } from "./GameController"

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext, scene: Scene) => void;
  onCameraReady?: (camera: PerspectiveCamera) => void;
  style?: any;
  onTouchMove?: (dx: number, dy: number) => void;
  onTouchEnd?: (x: number, y: number) => void;
}

interface ExpoGLContext extends WebGLRenderingContext {
  endFrameEXP?: () => void;
}

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onContextCreate,
  onCameraReady,
  style,
  onTouchMove,
  onTouchEnd
}) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const totalMovementRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const onGLContextCreate = async (gl: ExpoGLContext) => {
    console.log('🎥 GL Context Create Start');
    const renderer = new Renderer({ gl, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    console.log('🎥 Renderer Created');

    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 55);
    camera.lookAt(0, 0, 40);
    cameraRef.current = camera;
    console.log('🎥 Camera Created', {
      position: camera.position,
      hasCamera: !!cameraRef.current
    });

    const skyBlueColor = new Color(colorToHex(Colors.skyBlue));
    sceneRef.current.background = skyBlueColor;
    sceneRef.current.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.005);

    console.log('🎥 Calling Context Create Handler');
    onContextCreate?.(gl, sceneRef.current);
    console.log('🎥 Context Create Handler Complete');

    // Now call camera ready AFTER context create, so the pawn exists
    if (onCameraReady) {
      console.log('🎥 Calling Camera Ready Handler');
      onCameraReady(camera);
      console.log('🎥 Camera Ready Handler Complete');
    } else {
      console.log('❌ No Camera Ready Handler');
    }

    const render = () => {
      requestAnimationFrame(render);

      // Just update the game controller, which will update the pawn
      sceneRef.current.children.forEach(child => {
        if (child instanceof GameController) {
          child.update(0.016);
        }
      });

      renderer.render(sceneRef.current, camera);
      gl.endFrameEXP?.();
    };
    render();
    console.log('🎥 Render Loop Started');
  };

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const handleTouchStart = (event: any) => {
    console.log('🟢 TOUCH START', {
      touches: event.nativeEvent.touches,
      touch: event.nativeEvent.touches[0],
      timestamp: Date.now()
    });
    const touch = event.nativeEvent.touches[0];
    lastTouchRef.current = { x: touch.locationX, y: touch.locationY };
    // Reset total movement on touch start
    totalMovementRef.current = { dx: 0, dy: 0 };
  };

  const handleTouchMove = (event: any) => {
    console.log('🔵 TOUCH MOVE raw event', {
      touches: event.nativeEvent.touches,
      touch: event.nativeEvent.touches[0],
      lastTouch: lastTouchRef.current,
      timestamp: Date.now()
    });

    if (!lastTouchRef.current || !onTouchMove) {
      console.log('❌ TOUCH MOVE aborted - no last touch or no handler');
      return;
    }

    const touch = event.nativeEvent.touches[0];
    const dx = touch.locationX - lastTouchRef.current.x;
    const dy = touch.locationY - lastTouchRef.current.y;

    // Accumulate total movement
    totalMovementRef.current.dx += Math.abs(dx);
    totalMovementRef.current.dy += Math.abs(dy);

    console.log('🔵 TOUCH MOVE calculated', { dx, dy, totalMovement: totalMovementRef.current });

    onTouchMove(dx, dy);

    lastTouchRef.current = { x: touch.locationX, y: touch.locationY };
  };

  const handleTouchEnd = (event: any) => {
    console.log('🔴 TOUCH END raw event', {
      changedTouches: event.nativeEvent.changedTouches,
      touch: event.nativeEvent.changedTouches[0],
      lastTouch: lastTouchRef.current,
      totalMovement: totalMovementRef.current,
      timestamp: Date.now()
    });

    if (!lastTouchRef.current || !onTouchEnd) {
      console.log('❌ TOUCH END aborted - no last touch or no handler');
      return;
    }

    const touch = event.nativeEvent.changedTouches[0];

    // Allow movement on both taps and short drags
    const totalMovement = Math.abs(totalMovementRef.current.dx) + Math.abs(totalMovementRef.current.dy);
    const isMovementGesture = totalMovement < 50; // Much more forgiving threshold

    console.log('🔴 TOUCH END movement', {
      totalMovement,
      isMovementGesture,
      accumulatedDx: totalMovementRef.current.dx,
      accumulatedDy: totalMovementRef.current.dy
    });

    if (isMovementGesture) {
      console.log('✨ Movement gesture detected', { x: touch.locationX, y: touch.locationY });
      onTouchEnd(touch.locationX, touch.locationY);
    }

    lastTouchRef.current = null;
    totalMovementRef.current = { dx: 0, dy: 0 };
  };

  return (
    <GLView
      style={[styles.glView, style]}
      onContextCreate={onGLContextCreate}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

const styles = StyleSheet.create({
  glView: {
    flex: 1,
  },
});
