import {
  BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"

export class AgentPawn extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private targetPosition: Vector3;
  public speed: number = 5; // units per second

  // Time accumulator for the sine curve
  private floatTime: number = 0;
  // Base height for the pawn's logical (center) position.
  private baseHeight: number;

  constructor() {
    super();
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(geometry, this.material);
    // Add the mesh as a child so we can animate it independently.
    this.add(this.mesh);

    // Set the pawn's logical center at a fixed height above the ground.
    this.baseHeight = 3;
    // The parent's position remains fixed (camera follows this center).
    this.position.y = this.baseHeight;
    // Initialize the target position (logical center) with the current position.
    this.targetPosition = this.position.clone();
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  moveTo(target: Vector3) {
    // Update only the horizontal (x/z) target; y remains fixed at baseHeight.
    this.targetPosition.set(target.x, this.baseHeight, target.z);
  }

  update(delta: number) {
    // Horizontal movement: update only x and z positions of the logical center.
    const currentHorizontal = new Vector3(this.position.x, 0, this.position.z);
    const targetHorizontal = new Vector3(this.targetPosition.x, 0, this.targetPosition.z);
    const direction = new Vector3().subVectors(targetHorizontal, currentHorizontal);
    const distance = direction.length();
    if (distance > 0.1) {
      direction.normalize();
      const moveDistance = Math.min(this.speed * delta, distance);
      this.position.x += direction.x * moveDistance;
      this.position.z += direction.z * moveDistance;
    }

    // Update the bobbing effect on the visual mesh.
    this.floatTime += delta;
    const amplitude = 0.5; // Oscillation amplitude (±0.5 blocks)
    const frequency = 1;   // Frequency in radians per second
    this.mesh.position.y = amplitude * Math.sin(frequency * this.floatTime);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
