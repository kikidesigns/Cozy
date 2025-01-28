import { Canvas, useFrame } from '@react-three/fiber/native';
import { View } from 'react-native';
import { useRef } from 'react';
import { Colors } from '../constants/Colors';
import * as THREE from 'three';

function Cube() {
  const meshRef = useRef<THREE.Mesh>();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={Colors.platform} />
    </mesh>
  );
}

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Canvas
        style={{ flex: 1 }}
        camera={{
          position: [0, 0, 6],
          fov: 75,
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Cube />
      </Canvas>
    </View>
  );
}