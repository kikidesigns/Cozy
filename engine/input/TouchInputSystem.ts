import {
  Dimensions, GestureResponderEvent, PanResponder, PanResponderGestureState
} from "react-native"
import * as THREE from "three"
import { GameController } from "../entities/GameController"

export class TouchInputSystem {
  public panResponder: any;
  private gameController: GameController;

  constructor(gameController: GameController) {
    this.gameController = gameController;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          const { locationX, locationY } = evt.nativeEvent;
          const { width, height } = Dimensions.get("window");
          const ndcX = (locationX / width) * 2 - 1;
          const ndcY = -(locationY / height) * 2 + 1;
          const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
          vector.unproject(this.gameController.camera);
          const dir = vector.sub(this.gameController.camera.position).normalize();
          const distance = -this.gameController.camera.position.y / dir.y;
          const target = this.gameController.camera.position
            .clone()
            .add(dir.multiplyScalar(distance));
          this.gameController.movePawnTo(target);
        }
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Slowed down: use 0.002 instead of 0.005
        const deltaAngle = -gestureState.dx * 0.002;
        this.gameController.rotateCamera(deltaAngle);
      },
    });
  }
}
