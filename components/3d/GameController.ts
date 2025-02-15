import { Object3D, PerspectiveCamera, Vector3 } from "three"
import { AgentPawn } from "./AgentPawn"

export class GameController extends Object3D {
  camera: PerspectiveCamera;
  pawn: AgentPawn;
  // Angle (in radians) controlling the camera's rotation around the pawn.
  cameraAngle: number = 0;
  // Fixed camera offset values.
  cameraDistance: number = 15;
  cameraHeight: number = 8;

  constructor(camera: PerspectiveCamera, pawn: AgentPawn) {
    super();
    this.camera = camera;
    this.pawn = pawn;

    // Set initial camera position relative to pawn
    this.updateCamera();
  }

  updateCamera() {
    // Get the pawn's current position
    const pawnPos = this.pawn.position;

    // Compute camera position based on angle and distance
    const offsetX = this.cameraDistance * Math.sin(this.cameraAngle);
    const offsetZ = this.cameraDistance * Math.cos(this.cameraAngle);

    // Update camera position relative to pawn
    this.camera.position.set(
      pawnPos.x + offsetX,
      pawnPos.y + this.cameraHeight,
      pawnPos.z + offsetZ
    );

    // Make camera look at pawn
    this.camera.lookAt(pawnPos);
  }

  update(delta: number) {
    // Update the pawn first
    if (this.pawn && typeof this.pawn.update === 'function') {
      this.pawn.update(delta);
    }

    // Update camera position
    this.updateCamera();
  }

  // Called on horizontal drag to rotate the camera around the pawn.
  rotateCamera(deltaAngle: number) {
    this.cameraAngle += deltaAngle;
  }

  // Called on tap to command the pawn to move to a target position.
  movePawnTo(target: Vector3) {
    console.log('🎯 Moving pawn', {
      from: [this.pawn.position.x.toFixed(2), this.pawn.position.z.toFixed(2)],
      to: [target.x.toFixed(2), target.z.toFixed(2)]
    });
    this.pawn.moveTo(target);
  }
}
