import { Object3D, PerspectiveCamera, Vector3 } from "three"
import { AgentPawn } from "./AgentPawn"

export class GameController extends Object3D {
  public camera: PerspectiveCamera;
  public pawn: AgentPawn;
  public cameraAngle: number = 0;
  public cameraDistance: number = 15;
  public cameraHeight: number = 8;

  constructor(camera: PerspectiveCamera, pawn: AgentPawn) {
    super();
    this.camera = camera;
    this.pawn = pawn;
  }

  update(delta: number) {
    // Update the pawn and adjust the camera accordingly.
    this.pawn.update(delta);
    const offsetX = this.cameraDistance * Math.sin(this.cameraAngle);
    const offsetZ = this.cameraDistance * Math.cos(this.cameraAngle);
    const targetPos = this.pawn.position.clone();
    this.camera.position.set(
      targetPos.x + offsetX,
      targetPos.y + this.cameraHeight,
      targetPos.z + offsetZ
    );
    this.camera.lookAt(targetPos);
  }

  rotateCamera(deltaAngle: number) {
    this.cameraAngle += deltaAngle;
  }

  movePawnTo(target: Vector3) {
    this.pawn.moveTo(target);
  }
}
