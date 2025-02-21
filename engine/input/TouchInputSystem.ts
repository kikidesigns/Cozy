import {
    Dimensions, GestureResponderEvent, PanResponder, PanResponderGestureState
} from "react-native"
import * as THREE from "three"
import { GameController } from "../entities/GameController"
import { NpcAgent } from "../entities/NpcAgent"

const DEMO_PLAYER_ID = "00000000-0000-0000-0000-000000000000";

export class TouchInputSystem {
  public panResponder: any;
  private gameController: GameController;
  private scene: THREE.Scene;

  constructor(gameController: GameController, scene: THREE.Scene) {
    this.gameController = gameController;
    this.scene = scene;
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
          console.log(
            `[TouchInput] Tap detected at: screen (${locationX.toFixed(
              1
            )}, ${locationY.toFixed(1)}) / ndc (${ndcX.toFixed(2)}, ${ndcY.toFixed(2)})`
          );
          const pointer = new THREE.Vector2(ndcX, ndcY);
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(pointer, this.gameController.camera);

          const intersects = raycaster.intersectObjects(this.scene.children, true);
          console.log(`[TouchInput] Number of intersects: ${intersects.length}`);
          let interactionHandled = false;

          if (intersects.length > 0) {
            for (let intersect of intersects) {
              console.log(
                `[TouchInput] Intersected object: ${intersect.object.name}, userData:`,
                intersect.object.userData
              );

              // Check if we hit a menu option first
              if (intersect.object.userData.interactionOption) {
                console.log(
                  `[TouchInput] Hit menu option: ${intersect.object.userData.interactionOption}`
                );
                // Find the root NPC by traversing up through all parents
                let npc = intersect.object;
                while (npc && !(npc instanceof NpcAgent) && npc.parent) {
                  npc = npc.parent;
                }

                if (npc instanceof NpcAgent) {
                  if (intersect.object.userData.interactionOption === "chat") {
                    console.log("[TouchInput] Triggering Chat action.");
                    npc.triggerPrivateChat(DEMO_PLAYER_ID);
                  }
                  interactionHandled = true;
                  break;
                } else {
                  console.log("[TouchInput] Could not find parent NPC for menu option.");
                }
              }

              if (intersect.object.userData.isNpc) {
                console.log("[TouchInput] NPC object hit!");
                let npc = intersect.object;
                while (npc && !(npc instanceof NpcAgent) && npc.parent) {
                  npc = npc.parent;
                }
                if (npc instanceof NpcAgent) {
                  console.log("[TouchInput] Starting NPC interaction.");
                  npc.startInteraction(this.gameController.camera, DEMO_PLAYER_ID);
                  interactionHandled = true;
                  break;
                } else {
                  console.log("[TouchInput] Found NPC flag but no startInteraction method.");
                }
              }
            }
          }
          if (!interactionHandled) {
            console.log("[TouchInput] No interactable hit; moving player pawn.");
            const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
            vector.unproject(this.gameController.camera);
            const dir = vector.sub(this.gameController.camera.position).normalize();
            const distance = -this.gameController.camera.position.y / dir.y;
            const target = this.gameController.camera.position.clone().add(dir.multiplyScalar(distance));
            this.gameController.movePawnTo(target);
          }
        }
      },
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const deltaAngle = -gestureState.dx * 0.001;
        this.gameController.rotateCamera(deltaAngle);
      },
    });
  }
}
