import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { View, PanResponder, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { useWindowDimensions } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

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

function CameraRig({ onRotationUpdate }) {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  
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
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });

  const handleRotationUpdate = useCallback((current, target) => {
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
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: Colors.background,
        width: Platform.OS === 'web' ? width : '100%',
        height: Platform.OS === 'web' ? height : '100%',
      }}
    >
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          position: 'absolute',
        }}
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
      <View 
        {...panResponder.panHandlers} 
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%',
          backgroundColor: 'green',
          zIndex: 1,
        }} 
      />
    </View>
  );
}