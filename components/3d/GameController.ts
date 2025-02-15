import { Object3D, PerspectiveCamera, Vector3 } from "three"
import { AgentPawn } from "./AgentPawn"

export class GameController extends Object3D {
  camera: PerspectiveCamera;
  pawn: AgentPawn;
  // Angle (in radians) controlling the camera’s rotation around the pawn.
  cameraAngle: number = 0;
  // Fixed camera offset values.
  cameraDistance: number = 15;
  cameraHeight: number = 8;

  constructor(camera: PerspectiveCamera, pawn: AgentPawn) {
    super();
    this.camera = camera;
    this.pawn = pawn;
  }

  update(delta: number) {
    // Let the pawn update its movement.
    this.pawn.update(delta);

    // Compute a circular offset based on the current angle.
    const offsetX = this.cameraDistance * Math.sin(this.cameraAngle);
    const offsetZ = this.cameraDistance * Math.cos(this.cameraAngle);
    const targetPos = this.pawn.position.clone();
    // Update camera position relative to the pawn.
    this.camera.position.set(
      targetPos.x + offsetX,
      targetPos.y + this.cameraHeight,
      targetPos.z + offsetZ
    );
    this.camera.lookAt(targetPos);
  }

  // Called on horizontal drag to rotate the camera around the pawn.
  rotateCamera(deltaAngle: number) {
    this.cameraAngle += deltaAngle;
  }

  // Called on tap to command the pawn to move to a target position.
  movePawnTo(target: Vector3) {
    this.pawn.moveTo(target);
  }
}
