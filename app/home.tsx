import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { View, PanResponder } from 'react-native';
import { Colors } from '../constants/Colors';
import { Platform } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useRef, useState, useEffect } from 'react';
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

function CameraRig({ panResponder }) {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  
  useFrame(() => {
    try {
      // Ensure panResponder and its properties exist
      if (!panResponder?.current || 
          typeof panResponder.current !== 'object' || 
          !camera) {
        return;
      }
      
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
      
      camera.position.x = Math.sin(currentRotation.current.x) * 10;
      camera.position.z = Math.cos(currentRotation.current.x) * 10;
      camera.position.y = 3 + currentRotation.current.y * 2;
      camera.lookAt(0, 0, 0);

      // Only update if the properties exist
      if (panResponder.current.rotation && panResponder.current.targetRotation) {
        panResponder.current.rotation = { ...currentRotation.current };
        panResponder.current.targetRotation = { ...targetRotation.current };
      }
    } catch (error) {
      console.error('Error in CameraRig:', error);
    }
  });

  return null;
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  
  const panResponderRef = useRef({ 
    rotation: { x: 0, y: 0 }, 
    targetRotation: { x: 0, y: 0 } 
  });

  useEffect(() => {
    // Ensure the scene is ready before enabling interactions
    setIsSceneReady(true);
    return () => setIsSceneReady(false);
  }, []);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      if (!isSceneReady) return;
      setIsDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      try {
        if (!isSceneReady || !panResponderRef.current?.rotation) return;
        
        panResponderRef.current.rotation.x -= gesture.dx * 0.01;
        panResponderRef.current.rotation.y = THREE.MathUtils.clamp(
          panResponderRef.current.rotation.y + gesture.dy * 0.01,
          -1,
          1
        );
      } catch (error) {
        console.error('Error in pan responder move:', error);
      }
    },
    onPanResponderRelease: () => {
      try {
        if (!isSceneReady) return;
        setIsDragging(false);
        
        if (panResponderRef.current?.targetRotation && panResponderRef.current?.rotation) {
          panResponderRef.current.targetRotation.x = panResponderRef.current.rotation.x;
          panResponderRef.current.targetRotation.y = panResponderRef.current.rotation.y;
        }
      } catch (error) {
        console.error('Error in pan responder release:', error);
      }
    },
  });
  
  if (!isSceneReady) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.background 
      }} />
    );
  }

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
        <CameraRig panResponder={panResponderRef} />
      </Canvas>
      <View 
        {...panResponder.panHandlers} 
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%' 
        }} 
      />
    </View>
  );
}