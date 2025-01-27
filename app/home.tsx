import { Canvas } from '@react-three/fiber/native';
import { View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Platform } from 'react-native';
import { useWindowDimensions } from 'react-native';

function Scene() {
  return (
    <>
      {/* Platform */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[10, 10, 0.5, 32]} />
        <meshStandardMaterial color={Colors.platform} />
      </mesh>

      {/* Sun */}
      <mesh position={[0, 5, -20]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={Colors.sun} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
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
          position: [0, 2, 10],
          fov: 75,
        }}
      >
        <Scene />
      </Canvas>
    </View>
  );
}