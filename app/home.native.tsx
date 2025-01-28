import { Canvas, useFrame } from '@react-three/fiber/native';
import { View, Dimensions } from 'react-native';
import { useRef } from 'react';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

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
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function HomeScreen() {
  return (
    <View style={{ width, height }}>
      <Canvas
        style={{
          width: width,
          height: height,
        }}
        camera={{
          position: [0, 0, 6],
          fov: 75,
        }}
      >
        <color attach="background" args={["navy"]} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Cube />
      </Canvas>
    </View>
  );
}