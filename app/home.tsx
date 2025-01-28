import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { View, PanResponder, Platform, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { useWindowDimensions } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface RotationState {
  x: number;
  y: number;
}

interface CameraRigProps {
  onRotationUpdate: (current: RotationState, target: RotationState) => void;
}

function Scene() {
  return (
    <>
      {/* Platform */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[8, 8, 0.2, 64]} />
        <meshStandardMaterial 
          color={Colors.platform}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Platform edge shadow/bevel effect */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[8.2, 7.8, 0.2, 64]} />
        <meshStandardMaterial 
          color={Colors.platform}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Sun */}
      <mesh position={[0, 15, -50]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color={Colors.sun} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 5]} intensity={0.8} />
      <directionalLight position={[-10, 20, -5]} intensity={0.3} />
    </>
  );
}

function CameraRig({ onRotationUpdate }: CameraRigProps) {
  const { camera } = useThree();
  const targetRotation = useRef<RotationState>({ x: 0, y: 0 });
  const currentRotation = useRef<RotationState>({ x: 0, y: 0 });
  
  useFrame(() => {
    if (!camera) return;
    
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
    
    camera.position.x = Math.sin(currentRotation.current.x) * 10;
    camera.position.z = Math.cos(currentRotation.current.x) * 10;
    camera.position.y = 3 + currentRotation.current.y * 2;
    camera.lookAt(0, 0, 0);

    if (onRotationUpdate) {
      onRotationUpdate(currentRotation.current, targetRotation.current);
    }
  });

  return null;
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef<RotationState>({ x: 0, y: 0 });
  const targetRotationRef = useRef<RotationState>({ x: 0, y: 0 });

  const handleRotationUpdate = useCallback((current: RotationState, target: RotationState) => {
    rotationRef.current = current;
    targetRotationRef.current = target;
  }, []);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      const newX = rotationRef.current.x - gesture.dx * 0.01;
      const newY = THREE.MathUtils.clamp(
        rotationRef.current.y + gesture.dy * 0.01,
        -1,
        1
      );
      
      rotationRef.current = { x: newX, y: newY };
      targetRotationRef.current = { x: newX, y: newY };
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.canvasContainer, { width, height }]}>
        <Canvas
          style={StyleSheet.absoluteFill}
          camera={{
            position: [0, 3, 10],
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
        >
          <Scene />
          <CameraRig onRotationUpdate={handleRotationUpdate} />
        </Canvas>
      </View>
      <View 
        {...panResponder.panHandlers} 
        style={[StyleSheet.absoluteFill, styles.touchHandler]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  canvasContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  touchHandler: {
    backgroundColor: 'transparent',
  },
});