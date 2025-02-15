import { THREE } from "expo-three"
import React, { useRef } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import { AgentPawn } from "../components/3d/AgentPawn"
import { BuildingsAndSidewalks } from "../components/3d/BuildingsAndSidewalks"
import { Environment } from "../components/3d/Environment"
import { GameController } from "../components/3d/GameController"
import { Lighting } from "../components/3d/Lighting"
import { ThreeCanvas } from "../components/3d/ThreeCanvas"
import { Colors } from "../constants/Colors"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Index() {
  // Hold references to the pawn and game controller.
  const pawnRef = useRef<AgentPawn | null>(null);
  const gameControllerRef = useRef<GameController | null>(null);

  const handleContextCreate = (gl: WebGLRenderingContext, scene: THREE.Scene) => {
    console.log('🎮 Context Create Start');

    // Create everything in one go
    const pawn = new AgentPawn();
    scene.add(pawn);
    pawnRef.current = pawn;

    console.log('🎮 Context Create End', {
      pawnCreated: !!pawnRef.current,
      pawnParent: pawnRef.current?.parent ? 'yes' : 'no',
      sceneChildren: scene.children.length
    });
  };

  // Once the camera is ready, create a GameController to update it relative to the pawn.
  const handleCameraReady = (camera: THREE.PerspectiveCamera, scene: THREE.Scene) => {
    console.log('🎮 Camera Ready Start', {
      hasPawn: !!pawnRef.current,
      pawnParent: pawnRef.current?.parent ? 'yes' : 'no'
    });

    if (pawnRef.current) {
      const gameController = new GameController(camera, pawnRef.current);
      scene.add(gameController);
      gameControllerRef.current = gameController;
      console.log('🎮 Game Controller Added');
    }
  };

  const handleTouchMove = (dx: number, dy: number) => {
    console.log('📱 INDEX: Touch Move', { dx, dy });
    if (gameControllerRef.current) {
      const deltaAngle = -dx * 0.005;
      console.log('🎮 Rotating camera', { deltaAngle });
      gameControllerRef.current.rotateCamera(deltaAngle);
    } else {
      console.log('❌ No game controller for rotation');
    }
  };

  const handleTouchEnd = (x: number, y: number) => {
    console.log('📱 INDEX: Touch End', { x, y });
    if (gameControllerRef.current) {
      const { width, height } = Dimensions.get('window');
      const ndcX = (x / width) * 2 - 1;
      const ndcY = -(y / height) * 2 + 1;
      console.log('🎯 Normalized coordinates', { ndcX, ndcY });

      const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
      vector.unproject(gameControllerRef.current.camera);
      const dir = vector
        .sub(gameControllerRef.current.camera.position)
        .normalize();
      const distance = -gameControllerRef.current.camera.position.y / dir.y;
      const target = gameControllerRef.current.camera.position
        .clone()
        .add(dir.multiplyScalar(distance));

      console.log('🎯 Moving pawn to', {
        target: { x: target.x, y: target.y, z: target.z },
        cameraPos: {
          x: gameControllerRef.current.camera.position.x,
          y: gameControllerRef.current.camera.position.y,
          z: gameControllerRef.current.camera.position.z
        }
      });

      gameControllerRef.current.movePawnTo(target);
    } else {
      console.log('❌ No game controller for movement');
    }
  };

  return (
    <View style={styles.container}>
      <ThreeCanvas
        style={styles.canvas}
        onContextCreate={handleContextCreate}
        onCameraReady={handleCameraReady}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue,
  },
  canvas: {
    flex: 1,
  },
});
