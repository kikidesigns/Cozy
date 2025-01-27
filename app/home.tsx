import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { View, PanResponder } from 'react-native';
import { Colors } from '../constants/Colors';
import { Platform } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function Scene() {
  return (
    <>
      {/* Platform */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[8, 8, 0.2, 64]} />
        <meshStandardMaterial 
          color={Colors.platform}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Platform edge shadow/bevel effect */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

function CameraController() {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Spring back animation
  useFrame(() => {
    if (!isDragging) {
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
    }
    
    camera.position.x = Math.sin(currentRotation.current.x) * 10;
    camera.position.z = Math.cos(currentRotation.current.x) * 10;
    camera.position.y = 3 + currentRotation.current.y * 2;
    camera.lookAt(0, 0, 0);
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      currentRotation.current.x -= gesture.dx * 0.01;
      currentRotation.current.y = THREE.MathUtils.clamp(
        currentRotation.current.y + gesture.dy * 0.01,
        -1,
        1
      );
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
      // Reset target rotation to default (with some bounds)
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
    },
  });

  return <View {...panResponder.panHandlers} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.background,
      width: Platform.OS === 'web' ? width : '100%',
      height: Platform.OS === 'web' ? height : '100%',
    }}>
      <Canvas
        style={{
          flex: 1,
        }}
        camera={{
          position: [0, 3, 10],
          fov: 75,
        }}
      >
        <Scene />
      </Canvas>
      <CameraController />
    </View>
  );
}