import { GLView } from "expo-gl"
import { Renderer, THREE } from "expo-three"
import React, { useEffect, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { Color, FogExp2, PerspectiveCamera, Scene } from "three"
import { Colors } from "../../constants/Colors"

interface ThreeCanvasProps {
  onContextCreate?: (gl: WebGLRenderingContext, scene: Scene) => void;
  onCameraReady?: (camera: PerspectiveCamera) => void;
  style?: any;
}

interface ExpoGLContext extends WebGLRenderingContext {
  endFrameEXP?: () => void;
}

const colorToHex = (color: string) => parseInt(color.replace('#', '0x'));

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onContextCreate, onCameraReady, style }) => {
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<Renderer>();

  const onGLContextCreate = async (gl: ExpoGLContext) => {
    const renderer = new Renderer({ gl, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    if (onCameraReady) {
      onCameraReady(camera);
    }

    const skyBlueColor = new Color(colorToHex(Colors.skyBlue));
    sceneRef.current.background = skyBlueColor;
    sceneRef.current.fog = new FogExp2(colorToHex(Colors.skyBlue), 0.005);

    onContextCreate?.(gl, sceneRef.current);

    const render = () => {
      requestAnimationFrame(render);
      if (sceneRef.current) {
        sceneRef.current.children.forEach(child => {
          if ('update' in child && typeof child.update === 'function') {
            child.update(0.016); // ~60fps
          }
        });
      }
      renderer.render(sceneRef.current, camera);
      gl.endFrameEXP?.();
    };
    render();
  };

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={styles.glView} onContextCreate={onGLContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.skyBlue,
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
