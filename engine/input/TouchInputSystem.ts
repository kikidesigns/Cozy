// engine/input/TouchInputSystem.ts
import {
  Dimensions, GestureResponderEvent, PanResponder, PanResponderGestureState
} from "react-native"
import * as THREE from "three"
import { GameController } from "../entities/GameController"

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
            )}, ${locationY.toFixed(1)}) / ndc (${ndcX.toFixed(
              2
            )}, ${ndcY.toFixed(2)})`
          );
          const pointer = new THREE.Vector2(ndcX, ndcY);
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(pointer, this.gameController.camera);

          const intersects = raycaster.intersectObjects(
            this.scene.children,
            true
          );
          console.log(`[TouchInput] Number of intersects: ${intersects.length}`);
          let interactionHandled = false;
          if (intersects.length > 0) {
            for (let intersect of intersects) {
              console.log(
                `[TouchInput] Intersected object: ${intersect.object.name || "Unnamed"}, userData:`,
                intersect.object.userData
              );
              // Skip objects marked to ignore raycasts.
              if (intersect.object.userData.ignoreRaycast) {
                console.log("[TouchInput] Skipping object due to ignoreRaycast flag.");
                continue;
              }

              // Check if the object is a menu button.
              if (intersect.object.userData.interactionOption) {
                const option = intersect.object.userData.interactionOption;
                console.log(`[TouchInput] Hit menu option: ${option}`);
                let parentMenu = intersect.object.parent;
                if (parentMenu && parentMenu.userData.isNpcInteractionMenu) {
                  if (option === "chat") {
                    console.log("[TouchInput] Triggering Chat action.");
                    parentMenu.onChat && parentMenu.onChat();
                  } else if (option === "trade") {
                    console.log("[TouchInput] Triggering Trade action.");
                    parentMenu.onTrade && parentMenu.onTrade();
                  }
                  interactionHandled = true;
                  break;
                }
              }

              // Check if the object is an NPC.
              if (intersect.object.userData.isNpc) {
                console.log("[TouchInput] NPC object hit!");
                // Traverse upward until we find an object that implements startInteraction.
                let npc = intersect.object;
                while (npc && typeof npc.startInteraction !== "function" && npc.parent) {
                  npc = npc.parent;
                }
                if (npc && typeof npc.startInteraction === "function") {
                  console.log("[TouchInput] Starting NPC interaction.");
                  npc.startInteraction(this.gameController.camera);
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
            const dir = vector
              .sub(this.gameController.camera.position)
              .normalize();
            const distance = -this.gameController.camera.position.y / dir.y;
            const target = this.gameController.camera.position
              .clone()
              .add(dir.multiplyScalar(distance));
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
